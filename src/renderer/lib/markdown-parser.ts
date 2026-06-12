import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
})

export function renderMarkdown(markdown: string): string {
  return md.render(markdown)
}

export function renderExportHtml(markdown: string, title: string): string {
  const body = md.render(markdown)
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 16px;
      line-height: 1.75;
      color: #333;
    }
    h1 { font-size: 1.8em; border-bottom: 1px solid #e8e8e8; padding-bottom: 0.3em; }
    h2 { font-size: 1.45em; }
    blockquote { border-left: 2px solid #4183c4; padding-left: 1em; color: #777; }
    code { background: #f5f5f5; padding: 0.15em 0.35em; border-radius: 3px; font-family: monospace; font-size: 0.9em; border: 1px solid #e8e8e8; }
    pre { background: #f5f5f5; border: 1px solid #e8e8e8; border-radius: 6px; padding: 1em; overflow-x: auto; }
    pre code { background: none; border: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #e8e8e8; padding: 0.4em 0.8em; }
    th { background: #f5f5f5; }
    img { max-width: 100%; }
    a { color: #4183c4; }
  </style>
</head>
<body>
${body}
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
