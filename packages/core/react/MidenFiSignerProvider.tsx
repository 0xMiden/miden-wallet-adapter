import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { SignerContext, type SignerContextValue } from '@miden-sdk/react';
import { useWallet, type WalletContextState } from './useWallet';
import {
  PrivateDataPermission,
  WalletAdapterNetwork,
  AllowedPrivateData,
} from '@demox-labs/miden-wallet-adapter-base';

// MIDENFI SIGNER PROVIDER
// ================================================================================================

export interface MidenFiSignerProviderProps {
  children: ReactNode;
  /** Network to connect to */
  network?: WalletAdapterNetwork;
  /** Private data permission level */
  privateDataPermission?: PrivateDataPermission;
  /** Allowed private data types */
  allowedPrivateData?: AllowedPrivateData;
}

/**
 * Inner component that builds SignerContext from wallet state.
 * Must be used inside WalletProvider.
 */
function SignerContextBuilder({
  children,
  network,
  privateDataPermission,
  allowedPrivateData,
}: MidenFiSignerProviderProps) {
  const wallet = useWallet();
  const {
    connected,
    publicKey,
    address,
    signBytes,
    connect: walletConnect,
    disconnect: walletDisconnect,
  } = wallet;

  // Wrap wallet connect/disconnect to match unified interface
  const connect = useCallback(async () => {
    await walletConnect(
      privateDataPermission ?? PrivateDataPermission.UponRequest,
      network ?? WalletAdapterNetwork.Testnet,
      allowedPrivateData ?? AllowedPrivateData.None
    );
  }, [walletConnect, privateDataPermission, network, allowedPrivateData]);

  const disconnect = useCallback(async () => {
    await walletDisconnect();
  }, [walletDisconnect]);

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

  return (
    <SignerContext.Provider value={signerContext}>
      {children}
    </SignerContext.Provider>
  );
}

/**
 * MidenFiSignerProvider bridges the MidenFi wallet adapter with MidenProvider.
 *
 * This component should be used INSIDE a WalletProvider:
 *
 * @example
 * ```tsx
 * <WalletProvider wallets={[new MidenWalletAdapter({ appName: "My App" })]}>
 *   <MidenFiSignerProvider>
 *     <MidenProvider config={{ rpcUrl: "testnet" }}>
 *       <App />
 *     </MidenProvider>
 *   </MidenFiSignerProvider>
 * </WalletProvider>
 * ```
 *
 * For connect/disconnect UI, use the existing useWallet hook:
 *
 * @example
 * ```tsx
 * const { connected, connect, disconnect, select, wallets } = useWallet();
 *
 * // Select a wallet first
 * select(wallets[0].adapter.name);
 *
 * // Then connect
 * await connect(PrivateDataPermission.UponRequest, WalletAdapterNetwork.Testnet);
 * ```
 */
export function MidenFiSignerProvider({
  children,
  network = WalletAdapterNetwork.Testnet,
  privateDataPermission = PrivateDataPermission.UponRequest,
  allowedPrivateData = AllowedPrivateData.None,
}: MidenFiSignerProviderProps) {
  return (
    <SignerContextBuilder
      network={network}
      privateDataPermission={privateDataPermission}
      allowedPrivateData={allowedPrivateData}
    >
      {children}
    </SignerContextBuilder>
  );
}
