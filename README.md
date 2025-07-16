# notebook-viewer-ts

📘 HTML viewer for Jupyter .ipynb files with Markdown rendering, code, outputs and folding.

- ✅ Object oriented (`Notebook`, `Cell`, `CellOutput`)
- ✅ Clean HTML rendering with Markdown management, code, outputs, errors
- ✅ Folded cell support (`collapsed`)
- ✅ Compatible with Tailwind, Bootstrap or custom styles
- ❌ No Jupyter runtime required

---

## 🚀 Installation

```bash
npm install notebook-viewer-ts
```

---

## 🔧 Basic use

```ts
import { Notebook } from 'notebook-viewer-ts';

fetch('/mon-file.ipynb')
  .then(res => res.text())
  .then(json => {
    const notebook = new Notebook(json); // string or JSON object
    const html = notebook.render('tailwind'); // 'none' or 'bootstrap' to
    document.getElementById('notebook').innerHTML = html;
  });
```

```html
<div id="notebook"></div>
```

---

## 💅 Recommended style

This package doesn't force any style.  
You can import a recommended style (optional):

Available in git repo : [notebook.css](https://github.com/anthonychaussin/NotebookTs/blob/master/demo/notebook.css)

Or integrate your own style with Tailwind, Bootstrap, etc.

---

## 📘 API publique

`new Notebook(json: string | object)`

Builds a notebook from a JSON or JSON string.

`notebook.render(ui?: 'none' | 'tailwind' | 'bootstrap'): string`

Returns a complete HTML file to be injected into your DOM.

---

## 📚 Examples

### Tailwind rendering + folding
- `ui: 'tailwind'` adds a “Show/Hide” button to each collapsed cell
- You can use `ui: ‘none’` to integrate your own style

### Angular integration (simplified example)

```ts
@Component({
  selector: 'ipynb-viewer',
  template: `<div [innerHTML]="html"></div>`
})
export class NotebookViewerComponent {
  notebook: string = input<string>();
  html = computed(() => {
    if(notebook()){
      return new Notebook(notebook()).render();
    } else {
      return '';
    }
  });
}
```

---

## 🔧 Development

### Build

```bash
npm run build
```

### Publication

```bash
npm publish --access public
```

---

## 🛠️ Coming soon (ideas)


---

## 📄 Licence

MIT
