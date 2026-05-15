import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.js$/,
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /\.js$/,
    exclude: /node_modules/,
  },
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress known warnings
        if (warning.code === 'SOURCEMAP_ERROR') return;
        warn(warning);
      },
    },
  },
  server: {
    port: 3000,
  },
});
