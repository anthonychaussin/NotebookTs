import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
                                    test: {
                                            globals: true,
                                            environment: 'jsdom'
                                    },
                                    resolve: {
                                            alias: {
                                                    'micromark-extension-gfm': resolve(projectRoot, 'src/vendor/micromark-extension-gfm.ts'),
                                                    'micromark-extension-math': resolve(projectRoot, 'src/vendor/micromark-extension-math.ts')
                                            }
                                    }
                            });
