import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import process from 'process';
// Include before any other styles
import '@sifi/shared-ui/dist/index.css';
import App from './App';
import './index.css';

// Buffer and process polyfills required for Coinbase / WalletConnect
declare let globalThis: any;
globalThis.Buffer = Buffer;
globalThis.process = process;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
