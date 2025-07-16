import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'NotebookViewerTs',
      fileName: (format) => `notebook-viewer-ts.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {},
    minify: true,
    outDir: 'cdn',
    emptyOutDir: true,
  }
});
