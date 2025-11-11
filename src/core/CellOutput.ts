import hljs from 'highlight.js/lib/core';
import katex from 'katex';
import {UI_ADAPTER} from './Cell';
import {UILibrary} from './Notebook';
import {hasAnsiEscape, renderAnsiText} from './ansi';

const getRegisteredLanguage = (language?: string): string | undefined => {
        if (!language) {
                return undefined;
        }
        const getLanguage = (hljs as unknown as {getLanguage?: (lang: string) => unknown}).getLanguage;
        if (typeof getLanguage === 'function' && !getLanguage(language)) {
                return undefined;
        }
        return language;
};

const escapeHtml = (value: string): string => value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const renderTextContent = (text: string, language?: string): string => {
        if (hasAnsiEscape(text)) {
                return renderAnsiText(text);
        }
        const registeredLanguage = getRegisteredLanguage(language);
        if (registeredLanguage) {
                return hljs.highlight(text, {language: registeredLanguage}).value;
        }
        return escapeHtml(text);
};

const resolveLanguage = (metadataLanguage?: string, fallbackLanguage?: string): string | undefined =>
        metadataLanguage ?? fallbackLanguage;

const normalizeText = (value?: string[] | string): string => Array.isArray(value) ? value.join('') : (value ?? '');

export abstract class CellOutput {
	public output_type!: 'execute_result' | 'stream' | 'display_data' | 'error' | 'pyout' | 'pyerr';

	public abstract render(ui: UILibrary, language?: string): string;

	public getLatexRender(ui: UILibrary, latex: string[]): string {
		return `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${katex.renderToString(latex.join('')
		                                                                                                       .trim()
		                                                                                                       .replace(/(?<=(?:begin|end){)([a-z]+)/gm, 'aligned'), {
			                                                                                                  throwOnError: false,
			                                                                                                  displayMode: true,
			                                                                                                  trust: false
		                                                                                                  })}</pre>`;
	}

	public getHtmlRender(html: string): string {
		return `<iframe sandbox="allow-same-origin" style="width:100%;border:none;height:150px" srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`;
	}

	public getImgRender(extension: string, base64: string): string {
		return `<img src="data:image/${extension};base64, ${base64}" alt="code result img">`;
	}
}

export class CellOutputStream extends CellOutput {
	public output_type!: 'stream';
	public name!: 'stdout' | 'stderr';
	public text!: string[];
	public metadata?: CellOutputMetadata;

        constructor(c: any) {
                super();
                Object.assign(this, c);
        }

        public render(ui: UILibrary, language?: string): string {
                const text = normalizeText(this.text);
                const metadataLanguage = this.metadata?.language;
                const content = renderTextContent(text, resolveLanguage(metadataLanguage, language));

                return `<pre class="output-stream ${UI_ADAPTER[ui]?.['out-stream'] ?? ''}">${content}</pre>`;
        }
}

export class CellOutputError extends CellOutput {
	public output_type!: 'error';
	public ename!: string;
	public evalue!: string;
	public traceback!: string[];
	public metadata?: CellOutputMetadata;

        constructor(c: any) {
                super();
                Object.assign(this, c);
        }

        public render(ui: UILibrary, language?: string): string {
                const tracebackHtml = renderAnsiText(this.traceback?.join('\n') ?? '');
                const header = [this.ename, this.evalue].filter(Boolean).join(': ');
                return `<pre class="output-error ${UI_ADAPTER[ui]?.['out-error'] ?? ''}">${escapeHtml(header)}</pre>
                                                <pre class="output-error ${UI_ADAPTER[ui]?.['out-error'] ?? ''}">${this.getHtmlRender(tracebackHtml)}</pre>`;
        }
}

export class CellOutputData extends CellOutput {
	public output_type!: 'display_data';
	public data?: {
		'text/plain'?: string[]|string;
		'text/html'?: string[]|string;
		'image/png'?: string[]|string;
		'application/json'?: [{json: string}],
	};
	public png?: string;
	public jpeg?: string;
	public latex?: string[];
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		super();
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		if (this.png) {
			return this.getImgRender('png', this.png);
		} else if (this.jpeg) {
			return this.getImgRender('jpeg', this.jpeg);
		} else if (this.latex) {
			return this.getLatexRender(ui, this.latex);
		}

		let display_data = this.data ?? {};
		let disp_result = '';
		if (display_data['text/html']) {
			if(typeof display_data['text/html'] === 'string') {
				disp_result += this.getHtmlRender(display_data['text/html']);
			} else {
				disp_result += this.getHtmlRender(display_data['text/html'].join(''));
			}

		}
		if (display_data['image/png']) {
			if(typeof display_data['image/png'] === 'string') {
				disp_result += this.getImgRender('png', display_data['image/png']);
			} else {
				disp_result += display_data['image/png'].map(d => this.getImgRender('png', d));
			}
		}
                if (display_data['text/plain'] && !disp_result) {
                        const textPlain = normalizeText(display_data['text/plain']);
                        const metadataLanguage = this.metadata?.['text/plain']?.language as string | undefined;
                        const content = renderTextContent(textPlain, resolveLanguage(metadataLanguage, language));
                        disp_result = `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${content}</pre>`;
                }
                return disp_result;
        }
}

export class CellOutputExecResult extends CellOutput {
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
		super();
		Object.assign(this, c);
	}

	public render(ui: UILibrary, language?: string): string {
		const execute_result = this.data ?? {};
		let exe_result = '';
		if (execute_result['text/html']) {
			exe_result = this.getHtmlRender(execute_result['text/html'].join(''));
                } else if (execute_result['text/plain']) {
                        const textPlain = normalizeText(execute_result['text/plain']);
                        const metadataLanguage = this.metadata?.['text/plain']?.language as string | undefined;
                        const content = renderTextContent(textPlain, resolveLanguage(metadataLanguage, language));
                        exe_result = `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${content}</pre>`;
                }
                if (execute_result['image/png']) {
                        exe_result += execute_result['image/png'].map(d => this.getImgRender('png', d));
                }
                return exe_result;
	}
}

export class CellPyOutputExecResult extends CellOutput {
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
		super();
		Object.assign(this, c);
		if (this.prompt_number) {
			this.execution_count = this.prompt_number;
		}
	}

	public render(ui: UILibrary, language?: string): string {
		switch (true) {
			case !!this.png:
				return this.getImgRender('png', this.png);
			case !!this.jpeg:
				return this.getImgRender('jpeg', this.jpeg);
			case !!this.html:
				return this.getHtmlRender(this.html.join(''));
			case !!this.svg:
				return this.svg.join('');
			case !!this.latex:
				return this.getLatexRender(ui, this.latex);
                        default: {
                                const metadataLanguage = this.metadata?.['text/plain']?.language as string | undefined;
                                const content = renderTextContent(this.text.join(''), resolveLanguage(metadataLanguage, language));
                                return `<pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${content}</pre>`;
                        }
                }
        }
}


export class CellPyOutputExecError extends CellOutput {
	public output_type!: 'pyerr';
	public execution_count?: number;
	public prompt_number?: number;
	public traceback: string [] = [];
	public ename?: string;
	public evalue?: string;
	public metadata?: CellOutputMetadata;

	constructor(c: any) {
		super();
		Object.assign(this, c);
		if (this.prompt_number) {
			this.execution_count = this.prompt_number;
		}
	}

        public render(ui: UILibrary, language?: string): string {
                const content = renderTextContent(this.traceback.join(''), resolveLanguage(this.metadata?.['text/plain']?.language as string | undefined, language));
                return `<h3>${escapeHtml(this.ename ?? '')}</h3><pre class="output-result ${UI_ADAPTER[ui]?.['out-result'] ?? ''}">${content}</pre>`;
        }
}

export interface CellOutputMetadataEntry {
        language?: string;
        [key: string]: any;
}

export interface CellOutputMetadata {
        isolated?: boolean;
        language?: string;
        'text/plain'?: CellOutputMetadataEntry;
        'text/html'?: Record<string, any>;
        'image/png'?: {
                width?: number;
                height?: number;
        };
        'application/json'?: Record<string, any>;
}
