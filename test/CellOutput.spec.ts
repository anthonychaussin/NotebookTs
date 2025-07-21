import { describe, it, expect } from 'vitest';
import {CellOutputExecResult, CellOutputStream} from '../src';

describe('CellOutput', () => {
	it('devrait afficher un output de type stream', () => {
		const output = {
			output_type: 'stream',
			name: 'stdout',
			text: ['Hello world\n'],
		};

		const element = new CellOutputStream(output).render('python');

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

		const element = new CellOutputExecResult(output).render('python');

		expect(element).toContain('42');
		expect(element).toMatch(/<pre[\s\S]*?>[\s\S]*?<\/pre>/);
	});
});
