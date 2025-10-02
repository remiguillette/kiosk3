import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    },
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    define: {
      'import.meta.env.VITE_DEV_SERVER_URL': JSON.stringify(env.VITE_DEV_SERVER_URL)
    }
  };
});
