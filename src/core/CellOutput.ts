import hljs from 'highlight.js';

export class CellOutputStream implements CellOutput {
	public output_type!: 'stream';
	public name!: 'stdout' | 'stderr';
	public text!: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(language: string): string {
		return `<pre class="output-stream">${hljs.highlight(this.text?.join(''), {language: 'bash'}).value}</pre>`;
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

	public render(language: string): string {
		return `<pre class="output-error">${this.ename}: ${this.evalue}\n${this.traceback?.join('\n')}</pre>`;
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
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		Object.assign(this, c);
	}

	public render(language: string): string {
		let display_data = this.data ?? {};
		let disp_result = '';
		if (display_data['text/html']) {
			console.log(display_data);
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
			disp_result = `<pre class="output-result">${hljs.highlight(display_data['text/plain'].join(''), {language: 'plaintext'}).value}</pre>`;
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

	public render(language: string): string {
		const execute_result = this.data ?? {};
		let exe_result = '';
		if (execute_result['text/plain']) {
			exe_result = `<pre class="output-result">${hljs.highlight(execute_result['text/plain'].join(''), {language: 'bash'}).value}</pre>`;
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
	output_type: 'execute_result' | 'stream' | 'display_data' | 'error';

	render(language: string): string;
}
