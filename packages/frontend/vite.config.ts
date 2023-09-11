import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  optimizeDeps: {
    exclude: ['@sifi/shared-ui'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  envPrefix: 'REACT_APP_',
});
