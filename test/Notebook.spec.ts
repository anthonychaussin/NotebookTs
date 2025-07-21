import { describe, it, expect } from 'vitest';
import {CodeCell, Notebook} from '../src';

describe('Notebook', () => {
	it('devrait parser un notebook avec des cellules markdown et code', () => {
		const fakeJson = {
			cells: [
				{
					cell_type: 'markdown',
					source: ['# Hello\n', 'Ceci est du markdown'],
					metadata: {},
				},
				{
					cell_type: 'code',
					execution_count: 1,
					source: ['print("Hello")'],
					outputs: [],
					metadata: {},
				},
			],
			metadata: {},
			nbformat: 4,
			nbformat_minor: 5,
		};

		const notebook = new Notebook(fakeJson as any);

		expect(notebook.cells.length).toBe(2);

		expect(notebook.cells[0].cell_type).toBe('markdown');
		expect(notebook.cells[0].getStringSource()).toContain('# Hello');

		expect(notebook.cells[1].cell_type).toBe('code');
		expect((notebook.cells[1] as CodeCell).execution_count).toBe(1);
	});
});
