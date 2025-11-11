import { describe, it, expect } from 'vitest';
import {CellOutputExecResult, CellOutputStream} from '../src';

describe('CellOutput', () => {
	it('devrait afficher un output de type stream', () => {
		const output = {
			output_type: 'stream',
			name: 'stdout',
			text: ['Hello world\n'],
		};

                const element = new CellOutputStream(output).render('none', 'python');

                expect(element).toContain('Hello');
                expect(element).toContain('world');
                expect(element).toMatch(/<pre[\s\S]*?>[\s\S]*?<\/pre>/);
        });

	it('devrait afficher un execute_result simple', () => {
		const output = {
			output_type: 'execute_result',
			data: {
				'text/plain': ['42'],
			},
			metadata: {},
			execution_count: 1,
		};

                const element = new CellOutputExecResult(output).render('none', 'python');

                expect(element).toContain('42');
                expect(element).toMatch(/<pre[\s\S]*?>[\s\S]*?<\/pre>/);
        });

        it('devrait convertir les séquences ANSI en HTML pour les streams', () => {
                const output = {
                        output_type: 'stream' as const,
                        name: 'stdout' as const,
                        text: ['\u001b[31mError\u001b[0m'],
                };

                const element = new CellOutputStream(output).render('none');

                expect(element).toContain('style="color:#A00"');
                expect(element).not.toContain('\u001b');
        });

        it('devrait convertir les séquences ANSI en HTML pour text/plain', () => {
                const output = {
                        output_type: 'execute_result' as const,
                        data: {
                                'text/plain': ['\u001b[31mError\u001b[0m'],
                        },
                        metadata: {},
                        execution_count: 1,
                };

                const element = new CellOutputExecResult(output).render('none');

                expect(element).toContain('style="color:#A00"');
                expect(element).not.toContain('\u001b');
        });

        it('devrait conserver un rendu texte brut sans ANSI', () => {
                const output = {
                        output_type: 'execute_result' as const,
                        data: {
                                'text/plain': ['A < B & C'],
                        },
                        metadata: {},
                        execution_count: 1,
                };

                const element = new CellOutputExecResult(output).render('none');

                expect(element).toContain('A &lt; B &amp; C');
                expect(element).not.toContain('hljs');
        });
});
