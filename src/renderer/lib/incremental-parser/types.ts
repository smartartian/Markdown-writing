/**
 * Lightweight incremental Markdown parser — AST types.
 * Outputs ProseMirror-compatible JSONContent directly.
 */

// Block node types
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'codeBlock'
  | 'blockquote'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'horizontalRule'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'tableHeader'
  | 'mathBlock'
  | 'mermaidBlock'
  | 'taskList'
  | 'taskItem'
  | 'image'
  | 'hardBreak'

// Inline mark types
export type MarkType =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'link'

// Inline token types for parsing
export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'strike'; children: InlineToken[] }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'image'; alt: string; src: string }
  | { type: 'mathInline'; latex: string }
  | { type: 'hardBreak' }

// Block-level AST node
export interface BlockNode {
  type: BlockType
  attrs?: Record<string, unknown>
  content?: (BlockNode | TextNode)[]
  text?: string
  children?: BlockNode[]
  checked?: boolean   // for task items
  level?: number      // for headings
  language?: string   // for code blocks
  url?: string        // for links/images
  alt?: string        // for images
}

// Text node (leaf)
export interface TextNode {
  type: 'text'
  text: string
  marks?: MarkDef[]
}

export interface MarkDef {
  type: MarkType
  attrs?: Record<string, unknown>
}

// Line token (intermediate representation after line-level tokenizing)
export interface LineToken {
  type: string
  indent: number
  content: string
  level?: number     // heading level or list nesting
  ordered?: boolean  // for ordered lists
  checked?: boolean  // for task items
  language?: string  // for code fences
  meta?: string
}
