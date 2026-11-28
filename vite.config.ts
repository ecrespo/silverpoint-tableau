import { defineConfig } from 'vite';

// A static multi-page build with relative URLs, deployed under /silverpoint-tableau/vX.Y/ (TAB-Art. 2).
export default defineConfig({
  base: './',
  build: { target: 'es2022', rollupOptions: { input: { index: 'index.html', dialog: 'dialog.html' } } },
});
