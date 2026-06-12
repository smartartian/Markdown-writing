<p align="center">
  <img src="resources/logo-all.png" alt="Markdown writing" width="200">
</p>

<h1 align="center">Markdown writing</h1>

<p align="center">A WYSIWYG markdown editor inspired by Typora and Effie.</p>

## Features

- **WYSIWYG Editing** — type `#` + Enter, see formatted headings instantly
- **Source Mode** — toggle to raw markdown with syntax highlighting (`Cmd+/`)
- **Focus Mode** — dim non-active paragraphs (`Cmd+Shift+F`)
- **Typewriter Mode** — keep cursor centered vertically (`Cmd+Shift+T`)
- **File Tree** — browse local folders, right-click to create/delete files
- **Outline Panel** — real-time heading structure navigation
- **Themes** — light, dark, and sepia color schemes
- **Export** — PDF and HTML export
- **Image Paste** — `Cmd+V` to paste clipboard images, drag & drop support

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron + electron-vite |
| Editor | TipTap (ProseMirror) |
| Source Mode | CodeMirror 6 |
| UI | React 19 + Tailwind CSS |
| State | Zustand |
| Export | markdown-it |

## Development

```bash
npm install
npm run dev     # Start dev server with HMR
npm run build   # Production build
npm run package # Package for distribution
```

## License

MIT
