import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, render, screen, cleanup, act } from '@testing-library/react';
import React from 'react';

// Mock modules before imports
vi.mock('../useWallet', () => ({
  useWallet: vi.fn(),
}));

vi.mock('@miden-sdk/react', () => ({
  SignerContext: React.createContext(null),
}));

vi.mock('@demox-labs/miden-sdk', () => ({
  AccountStorageMode: {
    public: vi.fn(() => ({ toString: () => 'public' })),
    private: vi.fn(() => ({ toString: () => 'private' })),
  },
}));

vi.mock('@demox-labs/miden-wallet-adapter-base', () => ({
  PrivateDataPermission: {
    UponRequest: 'UponRequest',
    Allowed: 'Allowed',
    Denied: 'Denied',
  },
  WalletAdapterNetwork: {
    Testnet: 'testnet',
    Devnet: 'devnet',
  },
  AllowedPrivateData: {
    None: 'None',
    All: 'All',
  },
}));

import { useWallet } from '../useWallet';
import { SignerContext } from '@miden-sdk/react';
import { MidenFiSignerProvider } from '../MidenFiSignerProvider';
import {
  PrivateDataPermission,
  WalletAdapterNetwork,
  AllowedPrivateData,
} from '@demox-labs/miden-wallet-adapter-base';

// Test helpers
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createMockWallet = (overrides = {}) => ({
  connected: false,
  publicKey: null,
  address: null,
  signBytes: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('MidenFiSignerProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('renders children', () => {
      const mockWallet = createMockWallet();
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      render(
        <MidenFiSignerProvider>
          <div data-testid="child">Test Child</div>
        </MidenFiSignerProvider>
      );

      expect(screen.getByTestId('child')).toBeDefined();
      expect(screen.getByText('Test Child')).toBeDefined();
    });
  });

  describe('SignerContext when wallet not connected', () => {
    it('provides SignerContext with isConnected false when wallet not connected', async () => {
      const mockWallet = createMockWallet({ connected: false });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      expect(capturedContext).not.toBeNull();
      expect(capturedContext.isConnected).toBe(false);
    });

    it('signCb throws when wallet not connected', async () => {
      const mockWallet = createMockWallet({ connected: false });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      await expect(
        capturedContext.signCb(new Uint8Array(), new Uint8Array())
      ).rejects.toThrow('MidenFi wallet not connected');
    });
  });

  describe('SignerContext when wallet connected', () => {
    it('provides SignerContext with isConnected true when wallet connected', async () => {
      const mockWallet = createMockWallet({
        connected: true,
        publicKey: new Uint8Array(32).fill(0x42),
        address: '0xtest-address',
        signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext).not.toBeNull();
      expect(capturedContext.isConnected).toBe(true);
    });

    it('SignerContext.isConnected matches wallet.connected', async () => {
      const mockWallet = createMockWallet({
        connected: true,
        publicKey: new Uint8Array(32),
        address: '0xaddress',
        signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext.isConnected).toBe(mockWallet.connected);
    });
  });

  describe('connect delegation', () => {
    it('connect() delegates to wallet connect with correct params', async () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      const mockWallet = createMockWallet({
        connect: mockConnect,
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider
          network={WalletAdapterNetwork.Testnet}
          privateDataPermission={PrivateDataPermission.UponRequest}
          allowedPrivateData={AllowedPrivateData.None}
        >
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      await act(async () => {
        await capturedContext.connect();
      });

      expect(mockConnect).toHaveBeenCalledWith(
        PrivateDataPermission.UponRequest,
        WalletAdapterNetwork.Testnet,
        AllowedPrivateData.None
      );
    });
  });

  describe('disconnect delegation', () => {
    it('disconnect() delegates to wallet disconnect', async () => {
      const mockDisconnect = vi.fn().mockResolvedValue(undefined);
      const mockWallet = createMockWallet({
        disconnect: mockDisconnect,
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      await act(async () => {
        await capturedContext.disconnect();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("SignerContext name", () => {
    it("includes correct name ('MidenFi')", async () => {
      const mockWallet = createMockWallet();
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      expect(capturedContext.name).toBe('MidenFi');
    });
  });

  describe('signCb routing', () => {
    it('signCb routes to wallet.signBytes when connected', async () => {
      const mockSignBytes = vi.fn().mockResolvedValue(new Uint8Array(67).fill(0xab));
      const mockWallet = createMockWallet({
        connected: true,
        publicKey: new Uint8Array(32),
        address: '0xaddress',
        signBytes: mockSignBytes,
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      const signingInputs = new Uint8Array(100).fill(0x11);
      await act(async () => {
        await capturedContext.signCb(new Uint8Array(32), signingInputs);
      });

      expect(mockSignBytes).toHaveBeenCalledWith(signingInputs, 'signingInputs');
    });
  });

  describe('accountConfig', () => {
    it('uses publicKey from wallet as publicKeyCommitment', async () => {
      const publicKey = new Uint8Array(32).fill(0x55);
      const mockWallet = createMockWallet({
        connected: true,
        publicKey,
        address: '0xaddress',
        signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext.accountConfig.publicKeyCommitment).toBe(publicKey);
    });

    it('accountType is RegularAccountImmutableCode', async () => {
      const mockWallet = createMockWallet({
        connected: true,
        publicKey: new Uint8Array(32),
        address: '0xaddress',
        signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext.accountConfig.accountType).toBe(
        'RegularAccountImmutableCode'
      );
    });
  });

  describe('storeName', () => {
    it('includes address for database isolation', async () => {
      const mockWallet = createMockWallet({
        connected: true,
        publicKey: new Uint8Array(32),
        address: '0xunique-wallet-address',
        signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext.storeName).toBe('midenfi_0xunique-wallet-address');
    });
  });

  describe('context updates on wallet state change', () => {
    it('updates context when wallet connects', async () => {
      // Start disconnected
      const mockWallet = createMockWallet({
        connected: false,
      });
      vi.mocked(useWallet).mockReturnValue(mockWallet as any);

      let capturedContext: any = null;
      const TestConsumer = () => {
        const context = React.useContext(SignerContext);
        capturedContext = context;
        return null;
      };

      const { rerender } = render(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
      });

      expect(capturedContext.isConnected).toBe(false);

      // Now connect
      vi.mocked(useWallet).mockReturnValue(
        createMockWallet({
          connected: true,
          publicKey: new Uint8Array(32),
          address: '0xaddress',
          signBytes: vi.fn().mockResolvedValue(new Uint8Array(67)),
        }) as any
      );

      rerender(
        <MidenFiSignerProvider>
          <TestConsumer />
        </MidenFiSignerProvider>
      );

      await act(async () => {
        await flushPromises();
        await flushPromises();
      });

      expect(capturedContext.isConnected).toBe(true);
    });
  });
});
