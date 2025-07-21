import {Cell, CodeCell, MarkdownCell, RawCell} from './Cell';

export type UILibrary = 'tailwind' | 'bootstrap' | 'none';

export class Notebook {
	public cells: Cell[] = [];
	public metadata!: Metadata;
	public nbformat!: number;
	public nbformat_minor!: number;
	public displayText: string = "Display";
	public foldText: string = "Fold";

	constructor(json: string | any) {
		const raw = typeof json === 'string' ? JSON.parse(json) : json;

		if(raw.worksheets){
			raw.cells = raw.worksheets[0].cells;
		}

		raw.cells.forEach((c: any) => {
			switch (c.cell_type) {
				case 'code':
					this.cells.push(new CodeCell(c));
					break;
				case 'markdown':
					this.cells.push(new MarkdownCell(c));
					break;
				case 'raw':
					this.cells.push(new RawCell(c));
			}
		});
		this.metadata = raw.metadata;
		this.nbformat = raw.nbformat as number;
		this.nbformat_minor = raw.nbformat_minor as number;
	}

	render(ui: UILibrary = 'none'): string {
		return this.cells.map((c: Cell, index: number) => this.renderCell(c, index, ui, this.metadata.language_info?.name)).join('\n');
	}

	renderCell(cell: Cell, index: number, ui: UILibrary, language?: string): string {
		const isCollapsed = cell.metadata?.collapsed;
		const typeClass = cell.cell_type === 'code' ? 'code' : 'markdown';
		const content = cell.cell_type === 'code'
		                ? (cell as CodeCell).render(ui, language)
		                : (cell as MarkdownCell).render(ui);

		const id = `cell-${index}`;

		if (ui === 'tailwind') {
			return `
      <div class="cell ${typeClass} p-2 mb-4">
		    ${isCollapsed ?
		    `<button type = "button" class = "toggle-btn text-sm text-gray-400" data-toggle="#${id}">
					▶ ${this.displayText}
					</button>` : ''
				}
        <div id="${id}" class="${isCollapsed ? 'hidden' : ''}">
          ${content}
        </div>
      </div>
    `;
		} else if (ui === 'bootstrap') {
			return `
      <div id="parent-${id}" class="cell ${isCollapsed ? 'accordion-item' : ''} ${typeClass} mb-4 p-2">
        ${isCollapsed ?
        `<h2 class="accordion-header">
					<button class="accordion-button btn-outline-secondary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#${id}" aria-controls="${id}">
          ${this.displayText}
          </button></h2>` : ''}
        <div id="${id}" class="accordion-collapse collapse ${isCollapsed ? '' : 'show'}" data-bs-parent="#patent-${id}">
          <div class="accordion-body">${content}</div>
        </div>
      </div>
    `;
		} else {
			return `
  <div class="cell ${typeClass}">
  ${isCollapsed ?
    `<button type = "button" class = "toggle-btn" data-toggle="#${id}">▶ ${this.displayText}</button>
` : ''
			}
    <div id="${id}" class="${isCollapsed ? 'hidden' : ''}">
      ${content}
    </div>
  </div>
`;
		}
	}
}

export interface Metadata {
	signature: string;
	kernel_info: KernelInfo;
	language_info?: LanguageInfo;
}

export interface KernelInfo {
	name: string;
}

export class LanguageInfo {
	name!: string;
	version!: string;
	codemirror_mode!: string;
}
