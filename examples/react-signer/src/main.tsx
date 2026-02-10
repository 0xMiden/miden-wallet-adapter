import './polyfills';
import { createRoot } from 'react-dom/client';
import { MidenFiSignerProvider } from '@miden-sdk/miden-wallet-adapter-react';
import { WalletAdapterNetwork } from '@miden-sdk/miden-wallet-adapter-base';
import { MidenProvider } from '@miden-sdk/react';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <MidenFiSignerProvider
    network={WalletAdapterNetwork.Devnet}
    appName="Miden Wallet Adapter Example"
  >
    <MidenProvider config={{ rpcUrl: 'devnet', prover: 'devnet' }}>
      <App />
    </MidenProvider>
  </MidenFiSignerProvider>
);
