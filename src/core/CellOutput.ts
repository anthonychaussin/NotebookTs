import hljs from 'highlight.js';
import katex from 'katex';
import {UI_ADAPTER} from './Cell';
import {UILibrary} from './Notebook';

export class CellOutputStream implements CellOutput {
	public output_type!: 'stream';
	public name!: 'stdout' | 'stderr';
	public text!: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		return `<pre class="output-stream ${UI_ADAPTER[ui]?.['out-stream'] ?? ''}">${hljs.highlight(this.text?.join(''), {language: 'bash'}).value}</pre>`;
	}
}

export class CellOutputError implements CellOutput {
	public output_type!: 'error';
	public ename!: string;
	public evalue!: string;
	public traceback!: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		return `<pre class="output-error ${UI_ADAPTER[ui]?.['out-error'] ?? ''}">${this.ename}: ${this.evalue}\n${this.traceback?.join('\n')}</pre>`;
	}
}

export class CellOutputData implements CellOutput {
	public output_type!: 'display_data';
	public data?: {
		'text/plain'?: string[];
		'text/html'?: string[];
		'image/png'?: string[];
		'application/json'?: [{json: string}],
	};
	public png?: string;
	public latex?: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		let display_data = this.data ?? {};
		let disp_result = '';
		if(this.png){
			return `<img src="data:image/png;base64, ${this.png}" alt="code result img">`;
		}else if(this.latex){
			return `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${katex.renderToString(this.latex.join(''), { throwOnError: false, displayMode: true })}</pre>`;
		}
		if (display_data['text/html']) {
			disp_result += `
  <iframe
    sandbox="allow-same-origin"
    style="width:100%;border:none;height:150px"
    srcdoc="${display_data['text/html'].join('').replace(/"/g, '&quot;')}"
  ></iframe>
`;
		}
		if (display_data['image/png']) {
			disp_result += `<img src="data:image/png;base64, ${display_data['image/png']}" alt="code result img">`;
		}
		if (display_data['text/plain'] && !disp_result) {
			disp_result = `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${hljs.highlight(display_data['text/plain'].join(''), {language: 'plaintext'}).value}</pre>`;
		}
		return disp_result;
	}
}

export class CellOutputExecResult implements CellOutput {
	public output_type!: 'execute_result';
	public execution_count?: number;
	public data?: {
		'text/plain'?: string[];
		'text/html'?: string[];
		'image/png'?: string[];
		'application/json'?: [{json: string}],
	};
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		const execute_result = this.data ?? {};
		let exe_result = '';
		if (execute_result['text/plain']) {
			exe_result = `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${hljs.highlight(execute_result['text/plain'].join(''), {language: 'bash'}).value}</pre>`;
		}
		if (execute_result['text/html']) {
			exe_result += hljs.highlight(execute_result['text/html'].join(''), {language: 'html'}).value;
		}
		if (execute_result['image/png']) {
			exe_result += `<img src="${execute_result['image/png']}" alt="stream result image">`;
		}
		return exe_result;
	}
}

export class CellPyOutputExecResult implements CellOutput {
	public output_type!: 'pyout';
	public execution_count?: number;
	public prompt_number?: number;
	public text: string [] = [];
	public png?: string;
	public html?: string[];
	public svg?: string[];
	public jpeg?: string;
	public latex?: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
		if(this.prompt_number) {
			this.execution_count = this.prompt_number;
		}
	}

	public render(ui: UILibrary, language?: string): string {
		if(this.jpeg) {
			return `<img src="data:image/jpeg;base64, ${this.jpeg}" alt="code result img">`;
		} else if(this.png) {
			return `<img src="data:image/png;base64, ${this.png}" alt="code result img">`;
		} else if(this.html){
			return `
  <iframe
    sandbox="allow-same-origin"
    style="width:100%;border:none;height:150px"
    srcdoc="${this.html.join('').replace(/"/g, '&quot;')}"
  ></iframe>
`;
		} else if(this.svg){
			return this.svg.join('');
		} else if(this.latex){
			return `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${katex.renderToString(this.latex.join('').split('$').filter(Boolean).join('').trim().replace(/begin\{.*}/, "begin{aligned}").replace(/end\{.*}/, "end{aligned}"), { throwOnError: false, displayMode: true })}</pre>`;
		}
		return `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${hljs.highlight(this.text.join(''), {language: 'python'}).value}</pre>`;
	}
}


export class CellPyOutputExecError implements CellOutput {
	public output_type!: 'pyerr';
	public execution_count?: number;
	public prompt_number?: number;
	public traceback: string [] = [];
	public ename?: string;
	public evalue?: string;
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
		if(this.prompt_number) {
			this.execution_count = this.prompt_number;
		}
	}

	public render(ui: UILibrary, language?: string): string {
		return `<h3>${this.ename}</h3><pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${hljs.highlight(this.traceback.join(''), {language: 'python'}).value}</pre>`;
	}
}

export interface CellOutputMetadata {
	isolated?: boolean;
	'text/plain'?: Record<string, any>;
	'text/html'?: Record<string, any>;
	'image/png'?: {
		width?: number;
		height?: number;
	};
	'application/json'?: Record<string, any>;
}

export interface CellOutput {
	output_type: 'execute_result' | 'stream' | 'display_data' | 'error' | 'pyout'|'pyerr';

	render(ui: UILibrary, language?: string): string;
}
