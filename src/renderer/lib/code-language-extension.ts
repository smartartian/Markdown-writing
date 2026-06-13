import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const LANGUAGES = [
  'text', 'javascript', 'typescript', 'python', 'html', 'css', 'json',
  'bash', 'shell', 'sql', 'java', 'c', 'cpp', 'csharp', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'yaml', 'xml', 'markdown', 'latex',
  'graphql', 'dockerfile', 'toml', 'ini', 'diff', 'mermaid',
]

export const CodeLanguageLabel = Extension.create({
  name: 'codeLanguageLabel',

  addProseMirrorPlugins() {
    const editor = this.editor

    const plugin = new Plugin({
      key: new PluginKey('codeLanguageLabel'),
      props: {
        decorations(state) {
          const decorations: Decoration[] = []
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'codeBlock') {
              const lang = node.attrs.language || 'text'

              const select = document.createElement('select')
              select.className = 'code-lang-select'
              select.setAttribute('data-code-lang', 'true')
              for (const l of LANGUAGES) {
                const option = document.createElement('option')
                option.value = l
                option.textContent = l
                if (l === lang) option.selected = true
                select.appendChild(option)
              }
              select.addEventListener('change', (e) => {
                const newLang = (e.target as HTMLSelectElement).value
                const tr = state.tr.setNodeAttribute(pos, 'language', newLang)
                editor.view.dispatch(tr)
              })
              select.title = '选择语言'

              const deco = Decoration.widget(pos + 1, () => select, {
                side: 1,
                stopEvent: () => true,
              })
              decorations.push(deco)
            }
          })
          return DecorationSet.create(state.doc, decorations)
        },
      },
    })

    return [plugin]
  },
})
