import hljs from 'highlight.js';
import {marked} from 'marked';
import {CellOutput, CellOutputData, CellOutputError, CellOutputExecResult, CellOutputStream, CellPyOutputExecResult} from './CellOutput';

export class Cell {
	public cell_type!: 'markdown' | 'code' | 'raw';
	public source!: string[] | string;
	public input!: string[] | string;
	public metadata?: CellMetadata;

	constructor(c: any) {
		Object.assign(this, c);
		if(!!this.input && !this.source){
			this.source = this.input;
		}
	}

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
			default:
				console.error(`Unknown output type ${output.output_type}`, output);
				return new CellOutputStream(output);
		}
	}
}

export class MarkdownCell extends Cell {
	public cell_type!: 'markdown';
	public outputs: string[];

	constructor(c: any) {
		super(c);
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
	public prompt_number?: number;
	public outputs!: CellOutput[];

	constructor(c: any) {
		super(c);
		Object.assign(this, c);
		if(this.prompt_number){
			this.execution_count = this.prompt_number;
		}
		this.outputs = c.outputs.map(this.findOutputType);
	}

	public render(language?: string): string {
		if ((this.outputs?.length ?? 0) + this.source.length === 0) {
			return '';
		}

		const output = this.outputs.map(o => o.render(this.metadata?.language ?? language)).join('\n');

		if (this.metadata!.executionInfo) {
			this.execution_count = 1;
		}

		let parsedCode = '';
		if(this.metadata?.language || language) {
			parsedCode = hljs.highlight(this.getStringSource(), {language: (this.metadata?.language ?? language)!}).value
		} else {
			parsedCode = hljs.highlightAuto(this.getStringSource()).value
		}

		return `
	<div class="cell-content">
    <div class="prompt in-prompt">In&nbsp;[${this.execution_count ?? '&nbsp;'}]:</div>
    <div class="in code-row">
      <pre class="input-code"><code class="hljs">${parsedCode}</code></pre>
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
