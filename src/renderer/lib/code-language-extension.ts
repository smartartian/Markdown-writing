import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * Shows a language label on code blocks that can be clicked to change.
 * Matches Typora's code block language UX.
 */
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
              const label = document.createElement('span')
              label.className = 'code-lang-label'
              label.textContent = lang
              label.onclick = (e) => {
                e.stopPropagation()
                const newLang = window.prompt('语言:', lang)?.toLowerCase()
                if (newLang !== undefined && newLang !== lang) {
                  const tr = state.tr.setNodeAttribute(pos, 'language', newLang)
                  editor.view.dispatch(tr)
                }
              }
              label.title = '点击切换语言'
              const deco = Decoration.widget(pos + 1, () => label, {
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
