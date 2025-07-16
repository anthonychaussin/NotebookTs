# notebook-ts

📘 Une librairie TypeScript pour parser et afficher les fichiers Jupyter `.ipynb` en HTML.

- ✅ Orientée objet (`Notebook`, `Cell`, `CellOutput`)
- ✅ Rendu propre en HTML avec gestion du Markdown, code, outputs, erreurs
- ✅ Support des cellules repliées (`collapsed`)
- ✅ Compatible avec Tailwind, Bootstrap ou styles personnalisés
- ❌ Aucun runtime Jupyter nécessaire

---

## 🚀 Installation

```bash
npm install notebook-viewer-ts
```

---

## 🔧 Utilisation de base

```ts
import { Notebook } from 'notebook-viewer-ts';

fetch('/mon-fichier.ipynb')
  .then(res => res.text())
  .then(json => {
    const notebook = new Notebook(json); // string ou objet JSON
    const html = notebook.render('tailwind'); // 'none' ou 'bootstrap' aussi
    document.getElementById('notebook').innerHTML = html;
  });
```

```html
<div id="notebook"></div>
```

---

## 💅 Style recommandé

Ce package ne force aucun style.  
Tu peux importer un style recommandé (optionnel) :

Disponible dans le répo git : [notebook.css](https://github.com/anthonychaussin/NotebookTs/blob/master/demo/notebook.css)

Ou intégrer ton propre style avec Tailwind, Bootstrap, etc.

---

## 📘 API publique

`new Notebook(json: string | object)`

Construit un notebook à partir d’un JSON ou d’une chaîne JSON.

`notebook.render(ui?: 'none' | 'tailwind' | 'bootstrap'): string`

Retourne un HTML complet à injecter dans ton DOM.

---

## 📚 Exemples

### Rendu Tailwind + repliement
- `ui: 'tailwind'` ajoute un bouton « Afficher/Masquer » dans chaque cellule repliée
- Tu peux utiliser `ui: 'none'` pour intégrer ton propre système

### Intégration Angular (exemple simplifié)

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

## 🔧 Développement

### Build

```bash
npm run build
```

### Publication

```bash
npm publish --access public
```

---

## 🛠️ À venir (idées)


---

## 📄 Licence

MIT
