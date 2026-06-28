import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // host: true exposes the dev server on 0.0.0.0 so that LAN devices can
    // connect when you run `npm run dev -- --host`.
    // Desktop development (localhost:3000) is unaffected.
    host: true,
  },
});
