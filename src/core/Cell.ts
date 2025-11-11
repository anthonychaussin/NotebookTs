import hljs from 'highlight.js';
import {micromark} from 'micromark'
import {
	CellOutput,
	CellOutputData,
	CellOutputError,
	CellOutputExecResult,
	CellOutputStream,
	CellPyOutputExecError,
	CellPyOutputExecResult
} from './CellOutput';
import {UILibrary} from './Notebook';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { math, mathHtml } from 'micromark-extension-math';

export const UI_ADAPTER: any = {
	'tailwind': {
		'cell-content': 'rounded flex mb-1.5',
		'input-code': 'overflow-auto border border-[#999] rounded m-0',
		'code': 'font-mono text-[0.95em] p-0',
		'output': 'rounded max-h-screen overflow-auto w-full',
		'out-code-row': 'flex flex-row items-center',
		'out-stream': 'p-0 m-auto',
		'out-result': 'p-0 m-auto',
		'out-error': 'text-[#ff6b6b] font-bold',
		'code-row': 'w-full',
		'prompt': 'w-[90px] font-mono select-none flex-shrink-0 text-right p-1.5',
		'cell-collapsed': 'rounded p-2 cursor-pointer relative',
		'toggle-btn': 'bg-none border-none cursor-pointer mb-2 italic text-[0.9rem]',
		'markdown': 'prose lg:prose-xl'
	},
	'bootstrap': {
		'cell-content': 'rounded d-flex mb-2',
		'input-code': 'overflow-auto border rounded m-0 border-secondary',
		'code': 'font-monospace p-0',
		'output': 'rounded overflow-auto w-100',
		'out-code-row': 'd-flex flex-row align-items-center',
		'out-stream': 'p-0 m-auto',
		'out-result': 'p-0 m-auto',
		'out-error': 'text-danger fw-bold',
		'code-row': 'w-100',
		'prompt': 'w-25 font-monospace user-select-none flex-shrink-0 text-end py-1 px-1 text-secondary',
		'cell-collapsed': 'rounded p-2 cursor-pointer position-relative',
		'toggle-btn': 'bg-transparent border-0 cursor-pointer mb-2 fst-italic'
	}
};

export class Cell {
	public cell_type!: 'markdown' | 'code' | 'raw';
	public source!: string[] | string;
	public input!: string[] | string;
	public metadata?: CellMetadata;

	constructor(c: any) {
		Object.assign(this, c);
		if (!!this.input && !this.source) {
			this.source = this.input;
		}
	}

	public getArraySource() {
		return (typeof this.source === 'string') ? [this.source] : this.source as unknown as string[];
	}

	public getStringSource() {
		return (typeof this.source === 'string') ? this.source as unknown as string + '':
		       (this.source as unknown as string[]).join('') + '';
	}

	findOutputType(output: any) {
		switch (output.output_type) {
			case 'stream':
				return new CellOutputStream(output);
			case 'execute_result':
				return new CellOutputExecResult(output);
			case 'error':
				return new CellOutputError(output);
			case 'display_data':
				return new CellOutputData(output);
			case 'pyout':
				return new CellPyOutputExecResult(output);
			case 'pyerr':
				return new CellPyOutputExecError(output);
			default:
				console.error(`Unknown output type ${output.output_type}`, output);
				return new CellOutputStream(output);
		}
	}
}

export class MarkdownCell extends Cell {
	public cell_type!: 'markdown';
	public outputs: string[];

	private static markOption = ({
			extensions: [math(), gfm()], 
			htmlExtensions: [mathHtml(), gfmHtml()],
			allowDangerousHtml: true
		});

	constructor(c: any) {
		super(c);
		Object.assign(this, c);
		this.outputs = [];
	}

	static addHeadingIds(html: string): string {
    	return html.replace(/<h([1-6])>([^<]+)<\/h\1>/g, (_, level, content) => {
        	const slug = MarkdownCell.slugify(content);
        	return `<h${level} id="${slug}">${content}</h${level}>`;
    	});
	}

 	static slugify(text: string): string {
    	return text
        	.trim()
        	.replace(/[^\w\s-]/g, '')
        	.replace(/\s+/g, '-');
	}


	static renderMarkdown(source: string): string {
    	const baseHtml = micromark(source, MarkdownCell.markOption);
    	return MarkdownCell.addHeadingIds(baseHtml);
	}

	public render(ui: UILibrary) {
		return `<div class="cell-content ${UI_ADAPTER[ui]?.['cell-content'] ?? ''}">
						<div class="prompt in-prompt ${UI_ADAPTER[ui]?.['prompt'] ?? ''}"></div>
						<div class="markdown ${UI_ADAPTER[ui]?.['markdown'] ?? ''}">${MarkdownCell.renderMarkdown(this.getStringSource())}</div></div>`;
	}
}

export class CodeCell extends Cell {
	public cell_type!: 'code';
	public execution_count?: number;
	public prompt_number?: number;
	public outputs!: CellOutput[];

	constructor(c: any) {
		super(c);
		Object.assign(this, c);
		if (this.prompt_number) {
			this.execution_count = this.prompt_number;
		}
		this.outputs = c.outputs.map(this.findOutputType);
	}

	public render(ui: UILibrary, language?: string): string {
		if ((this.outputs?.length ?? 0) + this.source.length === 0) {
			return '';
		}

		if (this.metadata!.executionInfo) {
			this.execution_count = 1;
		}

		let parsedCode = (this.metadata?.language || language) ?
		                 hljs.highlight(this.getStringSource(), {language: (this.metadata?.language ?? language)!}).value :
		                 hljs.highlightAuto(this.getStringSource()).value;
		const output = this.outputs.map(o => o.render(ui, this.metadata?.language ?? language)).join('\n');

		return `<div class="cell-content ${UI_ADAPTER[ui]?.['cell-content'] ?? ''}">
    <div class="prompt in-prompt ${UI_ADAPTER[ui]?.['prompt'] ?? ''}">In&nbsp;[${this.execution_count ?? '&nbsp;'}]:</div>
    <div class="in code-row ${UI_ADAPTER[ui]?.['code-row'] ?? ''}">
      <pre class="input-code ${UI_ADAPTER[ui]?.['input-code'] ?? ''}"><code class="hljs">${parsedCode}</code></pre>
    </div>
  </div>
    ${output ? `
	<div class="cell-content ${UI_ADAPTER[ui]?.['cell-content'] ?? ''}">
		<div class="prompt out-prompt ${UI_ADAPTER[ui]?.['prompt'] ?? ''}">Out&nbsp;[${this.execution_count ?? '&nbsp;'}]:</div>
    <div class="out code-row ${UI_ADAPTER[ui]?.['out-code-row'] ?? ''}"><div class="outputs">${output}</div></div>
  </div>` : ''}`;
	}
}

export class RawCell extends Cell {
	public cell_type!: 'raw';

	constructor(c: any) {
		super(c);
		Object.assign(this, c);
	}
}

export interface CellMetadata {
	collapsed: boolean;
	autoscroll: boolean | 'auto';
	deletable: boolean;
	format: string;
	name: string;
	language: string;
	tags: string[];
	id: string;
	executionInfo: Record<string, any>;
}
