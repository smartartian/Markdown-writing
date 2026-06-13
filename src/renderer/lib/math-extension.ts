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
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-type', 'math-block')
      dom.className = 'math-block-wrapper'
      try {
        katex.render(node.attrs.latex, dom, { displayMode: true, throwOnError: false })
      } catch {
        dom.textContent = node.attrs.latex
      }
      return { dom }
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' }), node.attrs.latex || '']
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

  // -- markdown parse/serialize for @tiptap/markdown (marked.js) --

  markdownTokenName: 'mathBlock',

  markdownTokenizer: {
    name: 'mathBlock',
    level: 'block',
    start(src: string) {
      const match = src.match(/^\$\$/m)
      return match ? match.index! : -1
    },
    tokenize(src: string) {
      const match = src.match(/^\$\$\n?([\s\S]*?)\n?\$\$/)
      if (match) {
        return {
          type: 'mathBlock',
          raw: match[0],
          text: match[1].trim(),
          tokens: [] as any[],
        }
      }
    },
  },

  parseMarkdown(token: { text?: string }) {
    return { type: 'mathBlock', attrs: { latex: token.text || '' } }
  },

  renderMarkdown(node: { attrs?: { latex?: string } }) {
    const latex = node.attrs?.latex || ''
    return `$$\n${latex}\n$$`
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
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-type="math-inline"]' },
      { tag: 'math-inline' },
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span')
      dom.setAttribute('data-type', 'math-inline')
      dom.className = 'math-inline-wrapper'
      try {
        katex.render(node.attrs.latex, dom, { displayMode: false, throwOnError: false })
      } catch {
        dom.textContent = node.attrs.latex
      }
      return { dom }
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' }), node.attrs.latex || '']
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

  // -- markdown parse/serialize for @tiptap/markdown (marked.js) --

  markdownTokenName: 'mathInline',

  markdownTokenizer: {
    name: 'mathInline',
    level: 'inline',
    start(src: string) {
      for (let i = 0; i < src.length; i++) {
        if (src[i] === '$' && src[i + 1] !== '$') {
          return i
        }
      }
      return -1
    },
    tokenize(src: string) {
      const match = src.match(/^\$([^$\n]+)\$/)
      if (match) {
        return {
          type: 'mathInline',
          raw: match[0],
          text: match[1],
          tokens: [] as any[],
        }
      }
    },
  },

  parseMarkdown(token: { text?: string }) {
    return { type: 'mathInline', attrs: { latex: token.text || '' } }
  },

  renderMarkdown(node: { attrs?: { latex?: string } }) {
    return `$${node.attrs?.latex || ''}$`
  },
})
