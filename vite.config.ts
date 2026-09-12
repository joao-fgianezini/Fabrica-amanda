import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import connectorPlugin from './server/connector-plugin.cjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), connectorPlugin()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
