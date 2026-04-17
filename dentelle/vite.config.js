import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  base: './',
  // Only inline everything for the standalone (file://) build.
  // `npm run build:standalone` → one self-contained index.html.
  // `npm run build`            → normal dist/ (assets split, preview works).
  plugins: mode === 'standalone' ? [viteSingleFile()] : [],
  build: {
    outDir: mode === 'standalone' ? 'dist-standalone' : 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 100 * 1024 * 1024,
    chunkSizeWarningLimit: 10 * 1024
  },
  server: {
    host: true,
    port: 5173
  }
}));
