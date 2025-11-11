import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
                                    server: {
                                            port: 3000
                                    },
                                    root: 'demo',
                                    resolve: {
                                            alias: {
                                                    'micromark-extension-gfm': resolve(projectRoot, 'src/vendor/micromark-extension-gfm.ts'),
                                                    'micromark-extension-math': resolve(projectRoot, 'src/vendor/micromark-extension-math.ts')
                                            }
                                    }
                            });
