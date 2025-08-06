import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
	                            build: {
		                            lib: {
			                            entry: path.resolve(__dirname, 'src/index.ts'),
			                            name: 'NotebookViewerTs',
			                            fileName: (format) => `notebook-viewer-ts.${format}.js`,
			                            formats: ['es', 'umd']
		                            },
		                            rollupOptions: {},
		                            sourcemap: false,
		                            outDir: 'cdn',
		                            emptyOutDir: true,
		                            minify: true
	                            }
                            });
