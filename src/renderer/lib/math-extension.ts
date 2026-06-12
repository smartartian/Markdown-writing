import { Node, mergeAttributes } from '@tiptap/core'
import katex from 'katex'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      setMath: (options: { latex: string; display?: boolean }) => ReturnType
    }
  }
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs.latex
    try {
      const html = katex.renderToString(latex, { displayMode: true, throwOnError: false })
      return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' }), html]
    } catch {
      return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' }), latex]
    }
  },

  addCommands() {
    return {
      setMath:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex: options.latex },
          })
        },
    }
  },
})

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs.latex
    try {
      const html = katex.renderToString(latex, { displayMode: false, throwOnError: false })
      return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' }), html]
    } catch {
      return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' }), latex]
    }
  },

  addInputRules() {
    return [
      {
        find: /\$\$(.+?)\$\$$/,
        handler: ({ state, range, match }) => {
          state.tr.replaceRangeWith(range.from, range.to, state.schema.nodes.mathBlock.create({ latex: match[1] }))
        },
        undoable: true,
      },
      {
        find: /\$(.+?)\$/,
        handler: ({ state, range, match }) => {
          state.tr.replaceRangeWith(range.from, range.to, state.schema.nodes.mathInline.create({ latex: match[1] }))
        },
        undoable: true,
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { $from } = this.editor.state.selection
        const node = $from.nodeBefore
        if (node && (node.type.name === 'mathInline' || node.type.name === 'mathBlock')) {
          this.editor.commands.deleteSelection()
          // Insert the raw LaTeX back as text
          const latex = node.attrs.latex
          const wrapper = node.type.name === 'mathBlock' ? `$$${latex}$$` : `$${latex}$`
          this.editor.commands.insertContent(wrapper)
          return true
        }
        return false
      },
    }
  },

  addCommands() {
    return {
      setMath:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex: options.latex },
          })
        },
    }
  },
})
