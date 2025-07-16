import hljs from 'highlight.js';
import {marked} from 'marked';
import {CellOutput, CellOutputData, CellOutputError, CellOutputExecResult, CellOutputStream} from './CellOutput';

export abstract class Cell {
	public cell_type!: 'markdown' | 'code' | 'raw';
	public source!: string[] | string;
	public metadata?: CellMetadata;

	public getArraySource() {
		if (typeof this.source === 'string') {
			return [this.source];
		} else {
			return this.source as unknown as string[];
		}
	}

	public getStringSource() {
		if (typeof this.source === 'string') {
			return this.source as unknown as string + '';
		} else {
			return (this.source as unknown as string[]).join('') + '';
		}
	}

	findOutputType(ouput: any) {
		switch (ouput.output_type) {
			case 'stream':
				return new CellOutputStream(ouput);
			case 'execute_result':
				return new CellOutputExecResult(ouput);
			case 'error':
				return new CellOutputError(ouput);
			case 'display_data':
				return new CellOutputData(ouput);
		}
	}
}

export class MarkdownCell extends Cell {
	public cell_type!: 'markdown';
	public outputs: string[];

	constructor(c: any) {
		super();
		Object.assign(this, c);
		this.outputs = [];
	}

	public render() {
		return `<div class="cell-content">
						<div class="prompt in-prompt"></div>
						<div class="markdown">${marked(this.getStringSource())}</div>
					</div>`;
	}
}

export class CodeCell extends Cell {
	public cell_type!: 'code';
	public execution_count?: number;
	public outputs!: CellOutput[];

	constructor(c: any) {
		super();
		Object.assign(this, c);
		this.outputs = c.outputs.map(this.findOutputType);
	}

	public render(language: string): string {
		if ((this.outputs?.length ?? 0) + this.source.length === 0) {
			return '';
		}

		const output = this.outputs.map(o => o.render(language)).join('\n');

		if (this.metadata!.executionInfo) {
			this.execution_count = 1;
		}

		return `
	<div class="cell-content">
    <div class="prompt in-prompt">In&nbsp;[${this.execution_count ?? '&nbsp;'}]:</div>
    <div class="in code-row">
      <pre class="input-code"><code class="hljs">${hljs.highlight(this.getStringSource(), {language}).value}</code></pre>
    </div>
  </div>
    ${output ? `
	<div class="cell-content">
		<div class="prompt out-prompt">Out&nbsp;[${this.execution_count ?? '&nbsp;'}]:</div>
    <div class="out code-row">
      <div class="outputs">${output}</div>
    </div>
  </div>
    ` : ''}
  `;
	}
}

export class RawCell extends Cell {
	public cell_type!: 'raw';

	constructor(c: any) {
		super();
		Object.assign(this, c);
	}
}

export interface CellMetadata {
	collapsed: boolean;
	autoscroll: boolean | 'auto';
	deletable: boolean;
	format: string;
	name: string;
	tags: string[];
	id: string;
	executionInfo: Record<string, any>;
}
