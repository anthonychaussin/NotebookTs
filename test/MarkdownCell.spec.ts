import {describe, it, expect} from 'vitest';
import {MarkdownCell} from '../src';

const createMarkdownCell = (source: string) => new MarkdownCell({
        cell_type: 'markdown',
        source: [source],
        metadata: {},
});

describe('MarkdownCell rendering', () => {
        it('renders GitHub-style tables', () => {
                const cell = createMarkdownCell(`| A | B |\n| - | - |\n| 1 | 2 |`);
                const rendered = cell.render('none');

                expect(rendered).toContain('<table>');
                expect(rendered).toContain('<th>A</th>');
                expect(rendered).toContain('<td>2</td>');
        });

        it('renders task list checkboxes', () => {
                const cell = createMarkdownCell('- [x] Done\n- [ ] Todo');
                const rendered = cell.render('none');

                expect(rendered).toContain('class="contains-task-list"');
                expect(rendered).toContain('<input type="checkbox" disabled="" checked="">');
                expect(rendered).toContain('<input type="checkbox" disabled="">');
        });

        it('renders inline math expressions', () => {
                const cell = createMarkdownCell('Formule : $a^2$');
                const rendered = cell.render('none');

                expect(rendered).toContain('<span class="math math-inline">a^2</span>');
        });
});
