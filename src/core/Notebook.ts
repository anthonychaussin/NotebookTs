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
		                ? (cell as CodeCell).render(language)
		                : (cell as MarkdownCell).render();

		const id = `cell-${index}`;

		if (ui === 'tailwind') {
			return `
      <div class="cell ${typeClass} border rounded p-2 mb-4">
        <button type="button" class="toggle-btn text-sm text-gray-400 hover:text-white" data-toggle="#${id}">
          ${isCollapsed ? '▶ ' + this.displayText : ''}
        </button>
        <div id="${id}" class="${isCollapsed ? 'hidden' : ''}">
          ${content}
        </div>
      </div>
    `;
		} else if (ui === 'bootstrap') {
			return `
      <div class="cell ${typeClass} mb-4">
        <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#${id}">
          ${isCollapsed ? '▶ ' + this.displayText : ''}
        </button>
        <div id="${id}" class="collapse ${!isCollapsed ? 'show' : ''}">
          ${content}
        </div>
      </div>
    `;
		} else {
			return `
  <div class="cell ${typeClass}">
  ${isCollapsed ?
    `<button type = "button" class = "toggle-btn" data-toggle="#${id}">▶ Afficher</button>
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
