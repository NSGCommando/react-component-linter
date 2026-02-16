import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'ui', // Tell Vite the "face" of the app is in the ui folder
  base: './', // Helpful to allow Electron to find relative paths
  build: {
    outDir: '../dist', // Output build files into 'dist'
    emptyOutDir: true
  }
});