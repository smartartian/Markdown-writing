import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { StarterKit } from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { MathBlock, MathInline } from './math-extension'
import { CodeLanguageLabel } from './code-language-extension'

const lowlight = createLowlight(common)

/**
 * Custom extension: converts heading patterns (# ## ...) only on Enter,
 * not while typing. Shows raw # syntax until you press Enter.
 */
const HeadingOnEnter = Extension.create({
  name: 'headingOnEnter',

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { $from, empty } = this.editor.state.selection
        if (!empty) return false

        const lineStart = $from.start()
        const lineEnd = $from.end()
        const lineText = this.editor.state.doc.textBetween(lineStart, lineEnd).trimEnd()

        const match = lineText.match(/^(#{1,6})\s+(.+)/)
        if (!match) return false

        const level = match[1].length
        const text = match[2].trimEnd()

        const headingNode = this.editor.schema.nodes.heading.create(
          { level },
          this.editor.schema.text(text),
        )
        const paragraphNode = this.editor.schema.nodes.paragraph.create()

        const tr = this.editor.state.tr
        tr.replaceWith(lineStart, lineEnd, [headingNode, paragraphNode])
        const cursorPos = lineStart + headingNode.nodeSize
        tr.setSelection(TextSelection.create(tr.doc, cursorPos))
        this.editor.view.dispatch(tr)

        return true
      },
    }
  },
})

export const editorExtensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    horizontalRule: {},
  }),

  HeadingOnEnter,

  Markdown.configure({
    indentation: { style: 'space', size: 2 },
  }),

  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),

  CodeLanguageLabel,

  Highlight,

  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'editor-link' },
  }),

  Image.configure({
    inline: true,
    allowBase64: true,
  }),

  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,

  TaskList,
  TaskItem.configure({ nested: true }),

  MathBlock,
  MathInline,

  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') return `标题 ${node.attrs.level}`
      return '开始写作...'
    },
  }),
]
