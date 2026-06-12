import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: (options: { code: string }) => ReturnType
    }
  }
}

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      code: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      { ...HTMLAttributes, 'data-type': 'mermaid', 'data-code': node.attrs.code },
      ['div', { class: 'mermaid-container' }, node.attrs.code || ''],
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-type', 'mermaid')
      dom.className = 'mermaid-wrapper'

      const container = document.createElement('div')
      container.className = 'mermaid-container'
      container.textContent = node.attrs.code || ''

      // Lazily import mermaid and render
      const renderDiagram = async () => {
        if (!node.attrs.code) return
        try {
          const mermaid = await import('mermaid/dist/mermaid.min.js')
          mermaid.default.initialize({ startOnLoad: false })
          const id = 'mermaid-' + Math.random().toString(36).slice(2, 8)
          const { svg } = await mermaid.default.render(id, node.attrs.code)
          container.innerHTML = svg
        } catch {
          container.textContent = node.attrs.code
        }
      }

      // Try to render on creation
      setTimeout(renderDiagram, 100)

      dom.appendChild(container)
      return { dom }
    }
  },

  addCommands() {
    return {
      setMermaid:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { code: options.code },
          })
        },
    }
  },
})

// Input rule: ```mermaid code ``` creates a mermaid block
export const MermaidInputRule = Node.create({
  name: 'mermaidInputRule',

  addInputRules() {
    return [
      {
        find: /```mermaid\n([\s\S]*?)```/,
        handler: ({ state, range, match }) => {
          state.tr.replaceRangeWith(
            range.from,
            range.to,
            state.schema.nodes.mermaidBlock?.create({ code: match[1].trim() }),
          )
        },
        undoable: true,
      },
    ]
  },
})
