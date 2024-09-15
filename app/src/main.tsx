import '@fontsource-variable/cinzel';
import { QueryClientProvider } from '@tanstack/react-query';
import { ArweaveWalletKit } from 'arweave-wallet-kit';
import { darkTheme } from 'node_modules/arweave-wallet-kit/dist/theme';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import { queryClient } from './services/network';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ArweaveWalletKit
        config={{
          permissions: [
            'ACCESS_ADDRESS',
            'ACCESS_ALL_ADDRESSES',
            'SIGN_TRANSACTION',
          ],
          ensurePermissions: true,
          appInfo: {
            name: 'AO Chess',
          },
        }}
        theme={{
          displayTheme: 'dark',
          radius: 'minimal',
          accent: {
            r: 111,
            g: 111,
            b: 111,
          },
          titleHighlight: {
            r: 2,
            g: 2,
            b: 2,
          },
        }}
      >
        <App />
      </ArweaveWalletKit>
    </QueryClientProvider>
  </React.StrictMode>,
);
