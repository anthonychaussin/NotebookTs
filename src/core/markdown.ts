import {micromark} from 'micromark';
import {gfm, gfmHtml} from 'micromark-extension-gfm';
import {math, mathHtml} from 'micromark-extension-math';

export function renderMarkdown(source: string): string {
        const baseHtml = micromark(source, {
                extensions: [gfm(), math()],
                htmlExtensions: [gfmHtml(), mathHtml()]
        });

        const withTables = transformTables(baseHtml);
        const withTasks = transformTaskLists(withTables);
        return transformInlineMath(withTasks);
}

function transformTables(html: string): string {
        return html.replace(/<p>([\s\S]*?)<\/p>/g, (match, content) => {
                const lines = content.trim().split(/\n+/);
                if (lines.length < 2) {
                        return match;
                }

                if (!/^\s*\|/.test(lines[0]) || !/^\s*\|/.test(lines[1])) {
                        return match;
                }

                const headerCells = splitTableRow(lines[0]);
                const separatorCells = splitTableRow(lines[1]);

                if (headerCells.length === 0 || headerCells.length !== separatorCells.length) {
                        return match;
                }

                const alignments = separatorCells.map(cell => parseAlignment(cell));
                if (alignments.includes(null)) {
                        return match;
                }

                const bodyLines = lines.slice(2).filter(line => line.trim().length > 0);
                const bodyRows = bodyLines.map(splitTableRow).filter(row => row.length === headerCells.length);

                if (bodyLines.length > 0 && bodyRows.length === 0) {
                        return match;
                }

                const headerHtml = headerCells
                        .map((cell, index) => createCell('th', cell, alignments[index] ?? undefined))
                        .join('');
                const bodyHtml = bodyRows
                        .map(row => {
                                const cells = row
                                        .map((cell, index) => createCell('td', cell, alignments[index] ?? undefined))
                                        .join('');
                                return `<tr>${cells}</tr>`;
                        })
                        .join('');

                return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
        });
}

function splitTableRow(row: string): string[] {
        const normalized = row.trim().replace(/^\|/, '').replace(/\|$/, '');
        return normalized.split('|').map(cell => cell.trim());
}

function parseAlignment(cell: string): 'left' | 'right' | 'center' | null | undefined {
        const trimmed = cell.trim();
        if (!/^:?-{1,}:?$/.test(trimmed.replace(/\s+/g, ''))) {
                return null;
        }

        const startsWithColon = trimmed.startsWith(':');
        const endsWithColon = trimmed.endsWith(':');

        if (startsWithColon && endsWithColon) {
                return 'center';
        }
        if (endsWithColon) {
                return 'right';
        }
        if (startsWithColon) {
                return 'left';
        }

        return undefined;
}

function createCell(tag: 'td' | 'th', value: string, alignment?: 'left' | 'right' | 'center'): string {
        const alignAttribute = alignment ? ` align="${alignment}"` : '';
        return `<${tag}${alignAttribute}>${value}</${tag}>`;
}

function transformTaskLists(html: string): string {
        return html.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, listContent) => {
                const items: string[] = [];
                let hasTaskItems = false;

                listContent.replace(/<li>([\s\S]*?)<\/li>/g, (_, itemContent) => {
                        const taskMatch = itemContent.trim().match(/^\[( |x|X)\]\s*([\s\S]*)$/);

                        if (taskMatch) {
                                hasTaskItems = true;
                                const checked = taskMatch[1].toLowerCase() === 'x';
                                const text = taskMatch[2];
                                const checkbox = `<input type="checkbox" disabled=""${checked ? ' checked=""' : ''}>`;
                                items.push(`<li class="task-list-item">${checkbox}${text}</li>`);
                        } else {
                                items.push(`<li>${itemContent}</li>`);
                        }

                        return '';
                });

                if (!hasTaskItems) {
                        return match;
                }

                return `<ul class="contains-task-list">${items.join('')}</ul>`;
        });
}

function transformInlineMath(html: string): string {
        return html.replace(/\$(.+?)\$/g, (_, expression: string) => {
                return `<span class="math math-inline">${expression}</span>`;
        });
}
