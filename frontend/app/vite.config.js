import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // 1. Forzamos al plugin de React a tratar los .js como archivos con JSX
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],
  // 2. Configuramos esbuild para que acepte JSX en archivos .js
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Solo archivos en src para evitar conflictos
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'SOURCEMAP_ERROR') return;
        warn(warning);
      },
    },
  },
  server: {
    port: 3000,
  },
});
