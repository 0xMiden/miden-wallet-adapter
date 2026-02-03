import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from 'react';
import { SignerContext, type SignerContextValue } from '@miden-sdk/react';
import {
  type Adapter,
  AllowedPrivateData,
  type MessageSignerWalletAdapterProps,
  type MidenTransaction,
  PrivateDataPermission,
  SignKind,
  WalletAdapterNetwork,
  WalletError,
  type WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError,
  WalletReadyState,
  type MidenSendTransaction,
  type MidenConsumeTransaction,
  type Asset,
  type InputNoteDetails,
  type TransactionOutput,
} from '@demox-labs/miden-wallet-adapter-base';
import type { NoteFilterTypes } from '@demox-labs/miden-sdk';
import { MidenWalletAdapter } from '@demox-labs/miden-wallet-adapter-miden';
import { useLocalStorage } from './useLocalStorage';

// TYPES
// ================================================================================================

export interface Wallet {
  adapter: Adapter;
  readyState: WalletReadyState;
}

export interface WalletContextState {
  autoConnect: boolean;
  wallets: Wallet[];
  wallet: Wallet | null;
  address: string | null;
  publicKey: Uint8Array | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;

  select(walletName: WalletName): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  requestTransaction?: MessageSignerWalletAdapterProps['requestTransaction'];
  requestAssets?: MessageSignerWalletAdapterProps['requestAssets'];
  requestPrivateNotes?: MessageSignerWalletAdapterProps['requestPrivateNotes'];
  signBytes?: MessageSignerWalletAdapterProps['signBytes'];
  importPrivateNote?: MessageSignerWalletAdapterProps['importPrivateNote'];
  requestConsumableNotes?: MessageSignerWalletAdapterProps['requestConsumableNotes'];
  waitForTransaction?: MessageSignerWalletAdapterProps['waitForTransaction'];
  requestSend?: MessageSignerWalletAdapterProps['requestSend'];
  requestConsume?: MessageSignerWalletAdapterProps['requestConsume'];
}

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

// MIDENFI SIGNER PROVIDER
// ================================================================================================

export interface MidenFiSignerProviderProps {
  children: ReactNode;
  /** Wallet adapters to use. Defaults to [MidenWalletAdapter] */
  wallets?: Adapter[];
  /** App name passed to the default MidenWalletAdapter */
  appName?: string;
  /** Network to connect to */
  network?: WalletAdapterNetwork;
  /** Auto-connect to previously selected wallet on mount. Defaults to true */
  autoConnect?: boolean;
  /** Private data permission level */
  privateDataPermission?: PrivateDataPermission;
  /** Allowed private data types */
  allowedPrivateData?: AllowedPrivateData;
  /** Error handler */
  onError?: (error: WalletError) => void;
  /** LocalStorage key for persisting wallet selection */
  localStorageKey?: string;
}

const initialState: {
  wallet: Wallet | null;
  adapter: Adapter | null;
  address: string | null;
  publicKey: Uint8Array | null;
  connected: boolean;
} = {
  wallet: null,
  adapter: null,
  address: null,
  publicKey: null,
  connected: false,
};

/**
 * MidenFiSignerProvider bridges the MidenFi wallet with MidenProvider.
 *
 * This is a unified provider that handles both wallet connection and signer context.
 *
 * @example
 * ```tsx
 * // Simplest usage - uses MidenWalletAdapter by default
 * <MidenFiSignerProvider>
 *   <MidenProvider config={{ rpcUrl: "testnet" }}>
 *     <App />
 *   </MidenProvider>
 * </MidenFiSignerProvider>
 *
 * // With custom options
 * <MidenFiSignerProvider
 *   appName="My DApp"
 *   network={WalletAdapterNetwork.Testnet}
 *   autoConnect={true}
 * >
 *   <MidenProvider config={{ rpcUrl: "testnet" }}>
 *     <App />
 *   </MidenProvider>
 * </MidenFiSignerProvider>
 *
 * // With custom wallets
 * <MidenFiSignerProvider wallets={[new CustomWalletAdapter()]}>
 *   <MidenProvider config={{ rpcUrl: "testnet" }}>
 *     <App />
 *   </MidenProvider>
 * </MidenFiSignerProvider>
 * ```
 *
 * For wallet operations, use the useMidenFiWallet hook:
 *
 * @example
 * ```tsx
 * const { connected, connect, disconnect, select, wallets } = useMidenFiWallet();
 *
 * // If multiple wallets, select one first
 * select(wallets[0].adapter.name);
 *
 * // Then connect
 * await connect();
 * ```
 */
export const MidenFiSignerProvider: FC<MidenFiSignerProviderProps> = ({
  children,
  wallets: walletsProp,
  appName = 'Miden DApp',
  network = WalletAdapterNetwork.Testnet,
  autoConnect = true,
  privateDataPermission = PrivateDataPermission.UponRequest,
  allowedPrivateData = AllowedPrivateData.None,
  onError,
  localStorageKey = 'walletName',
}) => {
  // Create default wallets if not provided
  const adapters = useMemo(
    () => walletsProp ?? [new MidenWalletAdapter({ appName })],
    [walletsProp, appName]
  );

  const [name, setName] = useLocalStorage<WalletName | null>(
    localStorageKey,
    null
  );
  const [{ wallet, adapter, address, publicKey, connected }, setState] =
    useState(initialState);
  const readyState = adapter?.readyState || WalletReadyState.Unsupported;
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnecting = useRef(false);
  const isDisconnecting = useRef(false);
  const isUnloading = useRef(false);

  // Wrap adapters to conform to the `Wallet` interface
  const [wallets, setWallets] = useState(() =>
    adapters.map((adapter) => ({
      adapter,
      readyState: adapter.readyState,
    }))
  );

  // When the adapters change, start to listen for changes to their `readyState`
  useEffect(() => {
    setWallets((wallets) =>
      adapters.map((adapter, index) => {
        const wallet = wallets[index];
        return wallet &&
          wallet.adapter === adapter &&
          wallet.readyState === adapter.readyState
          ? wallet
          : {
              adapter: adapter,
              readyState: adapter.readyState,
            };
      })
    );

    function handleReadyStateChange(
      this: Adapter,
      readyState: WalletReadyState
    ) {
      setWallets((prevWallets) => {
        const index = prevWallets.findIndex(({ adapter }) => adapter === this);
        if (index === -1) return prevWallets;

        const { adapter } = prevWallets[index]!;
        return [
          ...prevWallets.slice(0, index),
          { adapter, readyState },
          ...prevWallets.slice(index + 1),
        ];
      });
    }

    adapters.forEach((adapter) =>
      adapter.on('readyStateChange', handleReadyStateChange, adapter)
    );
    return () =>
      adapters.forEach((adapter) =>
        adapter.off('readyStateChange', handleReadyStateChange, adapter)
      );
  }, [adapters]);

  // When the selected wallet changes, initialize the state
  useEffect(() => {
    const wallet = name && wallets.find(({ adapter }) => adapter.name === name);
    if (wallet) {
      setState({
        wallet,
        adapter: wallet.adapter,
        connected: wallet.adapter.connected,
        address: wallet.adapter.address,
        publicKey: wallet.adapter.publicKey,
      });
    } else {
      setState(initialState);
    }
  }, [name, wallets]);

  // If the window is closing or reloading, ignore disconnect and error events
  useEffect(() => {
    function listener() {
      isUnloading.current = true;
    }

    window.addEventListener('beforeunload', listener);
    return () => window.removeEventListener('beforeunload', listener);
  }, [isUnloading]);

  // Handle the adapter's connect event
  const handleConnect = useCallback(() => {
    if (!adapter) return;
    setState((state) => ({
      ...state,
      connected: adapter.connected,
      address: adapter.address,
      publicKey: adapter.publicKey,
    }));
  }, [adapter]);

  // Handle the adapter's disconnect event
  const handleDisconnect = useCallback(() => {
    if (!isUnloading.current) setName(null);
  }, [isUnloading, setName]);

  // Handle the adapter's error event
  const handleError = useCallback(
    (error: WalletError) => {
      if (!isUnloading.current) (onError || console.error)(error);
      return error;
    },
    [isUnloading, onError]
  );

  // Setup and teardown event listeners when the adapter changes
  useEffect(() => {
    if (adapter) {
      adapter.on('connect', handleConnect);
      adapter.on('disconnect', handleDisconnect);
      adapter.on('error', handleError);
      return () => {
        adapter.off('connect', handleConnect);
        adapter.off('disconnect', handleDisconnect);
        adapter.off('error', handleError);
      };
    }
  }, [adapter, handleConnect, handleDisconnect, handleError]);

  // When the adapter changes, disconnect the old one
  useEffect(() => {
    return () => {
      adapter?.disconnect();
    };
  }, [adapter]);

  // Auto-select the first wallet if only one is available and none selected
  useEffect(() => {
    if (!name && wallets.length === 1) {
      setName(wallets[0].adapter.name);
    }
  }, [name, wallets, setName]);

  // If autoConnect is enabled, try to connect when the adapter changes and is ready
  useEffect(() => {
    if (
      isConnecting.current ||
      connected ||
      !autoConnect ||
      !adapter ||
      !(
        readyState === WalletReadyState.Installed ||
        readyState === WalletReadyState.Loadable
      )
    )
      return;

    (async function () {
      isConnecting.current = true;
      setConnecting(true);
      try {
        await adapter.connect(
          privateDataPermission,
          network,
          allowedPrivateData
        );
      } catch (error: any) {
        setName(null);
      } finally {
        setConnecting(false);
        isConnecting.current = false;
      }
    })();
  }, [isConnecting, connected, autoConnect, adapter, readyState, setName, privateDataPermission, network, allowedPrivateData]);

  // Connect the adapter to the wallet
  const connect = useCallback(async () => {
    if (isConnecting.current || isDisconnecting.current || connected) return;
    if (!adapter) throw handleError(new WalletNotSelectedError());

    if (
      !(
        readyState === WalletReadyState.Installed ||
        readyState === WalletReadyState.Loadable
      )
    ) {
      setName(null);

      if (typeof window !== 'undefined') {
        window.open(adapter.url, '_blank');
      }

      throw handleError(new WalletNotReadyError());
    }

    isConnecting.current = true;
    setConnecting(true);
    try {
      await adapter.connect(privateDataPermission, network, allowedPrivateData);
    } catch (error: any) {
      setName(null);
      throw error;
    } finally {
      setConnecting(false);
      isConnecting.current = false;
    }
  }, [
    isConnecting,
    isDisconnecting,
    connected,
    adapter,
    readyState,
    handleError,
    setName,
    privateDataPermission,
    network,
    allowedPrivateData,
  ]);

  // Disconnect the adapter from the wallet
  const disconnect = useCallback(async () => {
    if (isDisconnecting.current) return;
    if (!adapter) return setName(null);

    isDisconnecting.current = true;
    setDisconnecting(true);
    try {
      await adapter.disconnect();
    } catch (error: any) {
      setName(null);
      throw error;
    } finally {
      setDisconnecting(false);
      isDisconnecting.current = false;
    }
  }, [isDisconnecting, adapter, setName]);

  // Request transaction
  const requestTransaction:
    | MessageSignerWalletAdapterProps['requestTransaction']
    | undefined = useMemo(
    () =>
      adapter && 'requestTransaction' in adapter
        ? async (transaction: MidenTransaction) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestTransaction(transaction);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  // Request assets
  const requestAssets:
    | MessageSignerWalletAdapterProps['requestAssets']
    | undefined = useMemo(
    () =>
      adapter && 'requestAssets' in adapter
        ? async () => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestAssets();
          }
        : undefined,
    [adapter, handleError, connected]
  );

  // Request private notes
  const requestPrivateNotes:
    | MessageSignerWalletAdapterProps['requestPrivateNotes']
    | undefined = useMemo(
    () =>
      adapter && 'requestPrivateNotes' in adapter
        ? async (noteFilterType: NoteFilterTypes, noteIds?: string[]) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestPrivateNotes(noteFilterType, noteIds);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  const signBytes: MessageSignerWalletAdapterProps['signBytes'] | undefined =
    useMemo(
      () =>
        adapter && 'signBytes' in adapter
          ? async (message: Uint8Array, kind: SignKind) => {
              if (!connected) throw handleError(new WalletNotConnectedError());
              return await adapter.signBytes(message, kind);
            }
          : undefined,
      [adapter, handleError, connected]
    );

  const importPrivateNote:
    | MessageSignerWalletAdapterProps['importPrivateNote']
    | undefined = useMemo(
    () =>
      adapter && 'importPrivateNote' in adapter
        ? async (note: Uint8Array) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.importPrivateNote(note);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  const requestConsumableNotes:
    | MessageSignerWalletAdapterProps['requestConsumableNotes']
    | undefined = useMemo(
    () =>
      adapter && 'requestConsumableNotes' in adapter
        ? async () => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestConsumableNotes();
          }
        : undefined,
    [adapter, handleError, connected]
  );

  const waitForTransaction:
    | MessageSignerWalletAdapterProps['waitForTransaction']
    | undefined = useMemo(
    () =>
      adapter && 'waitForTransaction' in adapter
        ? async (txId: string, timeout?: number) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.waitForTransaction(txId, timeout);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  const requestSend:
    | MessageSignerWalletAdapterProps['requestSend']
    | undefined = useMemo(
    () =>
      adapter && 'requestSend' in adapter
        ? async (transaction) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestSend(transaction);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  const requestConsume:
    | MessageSignerWalletAdapterProps['requestConsume']
    | undefined = useMemo(
    () =>
      adapter && 'requestConsume' in adapter
        ? async (transaction) => {
            if (!connected) throw handleError(new WalletNotConnectedError());
            return await adapter.requestConsume(transaction);
          }
        : undefined,
    [adapter, handleError, connected]
  );

  // Build SignerContext value
  const [signerContext, setSignerContext] = useState<SignerContextValue | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function buildContext() {
      if (!connected || !publicKey || !address || !signBytes) {
        // Not connected - provide context with connect/disconnect but no signing capability
        setSignerContext({
          signCb: async () => {
            throw new Error('MidenFi wallet not connected');
          },
          accountConfig: null as any,
          storeName: '',
          name: 'MidenFi',
          isConnected: false,
          connect,
          disconnect,
        });
        return;
      }

      try {
        // Connected - build full context with signing capability
        const signCb = async (_: Uint8Array, signingInputs: Uint8Array) => {
          const result = await signBytes(signingInputs, 'signingInputs');
          return result;
        };

        if (!cancelled) {
          const { AccountStorageMode } = await import('@demox-labs/miden-sdk');

          setSignerContext({
            signCb,
            accountConfig: {
              // publicKey from wallet adapter is already the commitment
              publicKeyCommitment: publicKey,
              accountType: 'RegularAccountImmutableCode',
              storageMode: AccountStorageMode.public(),
            },
            storeName: `midenfi_${address}`,
            name: 'MidenFi',
            isConnected: true,
            connect,
            disconnect,
          });
        }
      } catch (error) {
        console.error('Failed to build MidenFi signer context:', error);
        if (!cancelled) {
          setSignerContext({
            signCb: async () => {
              throw new Error('MidenFi wallet not connected');
            },
            accountConfig: null as any,
            storeName: '',
            name: 'MidenFi',
            isConnected: false,
            connect,
            disconnect,
          });
        }
      }
    }

    buildContext();
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, address, signBytes, connect, disconnect]);

  const walletContextValue = useMemo(
    () => ({
      autoConnect,
      wallets,
      wallet,
      address,
      publicKey,
      connected,
      connecting,
      disconnecting,
      select: setName,
      connect,
      disconnect,
      requestTransaction,
      requestAssets,
      requestPrivateNotes,
      signBytes,
      importPrivateNote,
      requestConsumableNotes,
      waitForTransaction,
      requestSend,
      requestConsume,
    }),
    [
      autoConnect,
      wallets,
      wallet,
      address,
      publicKey,
      connected,
      connecting,
      disconnecting,
      setName,
      connect,
      disconnect,
      requestTransaction,
      requestAssets,
      requestPrivateNotes,
      signBytes,
      importPrivateNote,
      requestConsumableNotes,
      waitForTransaction,
      requestSend,
      requestConsume,
    ]
  );

  return (
    <WalletContext.Provider value={walletContextValue}>
      <SignerContext.Provider value={signerContext}>
        {children}
      </SignerContext.Provider>
    </WalletContext.Provider>
  );
};

/**
 * Hook for MidenFi wallet operations beyond the unified useSigner interface.
 * Use this to access wallet-specific methods like requestTransaction, requestAssets, etc.
 *
 * @example
 * ```tsx
 * const { connected, connect, disconnect, wallets, select } = useMidenFiWallet();
 *
 * // Connect
 * await connect();
 *
 * // Request a transaction
 * const txId = await requestTransaction({ ... });
 * ```
 */
export function useMidenFiWallet(): WalletContextState {
  const context = useContext(WalletContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useMidenFiWallet must be used within MidenFiSignerProvider');
  }
  return context;
}

// Re-export for backward compatibility
export { WalletContext };
export type { WalletContextState as MidenFiWalletContextState };
