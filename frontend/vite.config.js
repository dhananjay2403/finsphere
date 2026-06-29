import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,

    // Expose the dev server on all network interfaces so other devices on
    // the same LAN can open the app via http://<your-mac-ip>:3000
    host: true,

    // ---------------------------------------------------------------------------
    // Development proxy — forwards /api/* to the Express backend
    // ---------------------------------------------------------------------------
    // This is the key to making the app work from ANY device on the network:
    //
    //   Desktop → localhost:3000/api/...   → Vite → localhost:5001/api/...  ✓
    //   Mobile  → 192.168.x.x:3000/api/... → Vite → localhost:5001/api/...  ✓
    //
    // The Vite dev server runs on the Mac, so it can always reach localhost:5001
    // regardless of which device the browser is running on.
    //
    // With a proxy, VITE_API_URL can be the relative path "/api" and no
    // IP address or port ever needs to be hardcoded in the client bundle.
    // ---------------------------------------------------------------------------
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
