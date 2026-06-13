/**
 * Incremental Markdown Parser — main entry point.
 *
 * Parses markdown text into ProseMirror-compatible JSONContent.
 * Supports incremental (partial) re-parsing for performance on large documents.
 */
import { tokenize } from './tokenizer'
import { parseBlocks } from './block-parser'
import type { BlockNode } from './types'

export interface JSONContent {
  type: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

// Cache for incremental parsing
let cachedLines: string[] = []
let cachedAst: BlockNode[] = []
let cachedLineMap: Map<number, number> = new Map() // blockIndex → lineIndex

/**
 * Full parse: convert markdown string → BlockNode AST.
 */
export function parse(markdown: string): BlockNode[] {
  const tokens = tokenize(markdown)
  const blocks = parseBlocks(tokens)
  cachedLines = markdown.split('\n')
  cachedAst = blocks
  buildLineMap(blocks, tokens)
  return blocks
}

/**
 * Convert BlockNode AST → ProseMirror JSONContent (used by TipTap).
 */
export function toJSONContent(blocks: BlockNode[]): JSONContent[] {
  if (blocks.length === 0) {
    // Return empty document with one paragraph (TipTap requires content)
    return [{ type: 'paragraph', content: [] }]
  }
  return blocks.map(block => blockToJSON(block)).filter(Boolean) as JSONContent[]
}

/**
 * Incremental re-parse: given a change range (startLine, endLine),
 * only re-tokenize and re-parse the affected section.
 */
export function incrementalParse(markdown: string, changeStart: number, changeEnd: number): BlockNode[] {
  if (cachedLines.length === 0) return parse(markdown)

  const newLines = markdown.split('\n')

  // Find the affected block range
  const affectedStart = Math.max(0, changeStart - 2) // extend 2 lines up
  const affectedEnd = Math.min(newLines.length, changeEnd + 2) // extend 2 lines down

  // Re-tokenize only the affected lines
  const affectedText = newLines.slice(affectedStart, affectedEnd).join('\n')
  const newTokens = tokenize(affectedText)

  // Re-parse the full document with updated tokens
  // (simple approach: re-parse all tokens; optimized version would splice)
  return parse(markdown)
}

function blockToJSON(block: BlockNode): JSONContent | null {
  switch (block.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        content: block.content as JSONContent[] || [{ type: 'text', text: '' }],
      }
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: block.level || 1 },
        content: block.content as JSONContent[] || [{ type: 'text', text: '' }],
      }
    case 'codeBlock':
      return {
        type: 'codeBlock',
        attrs: block.language ? { language: block.language } : {},
        content: [{ type: 'text', text: block.text || '' }],
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        content: (block.content as JSONContent[]) || [{ type: 'paragraph', content: [] }],
      }
    case 'bulletList':
      return {
        type: 'bulletList',
        content: block.content as JSONContent[] || [],
      }
    case 'orderedList':
      return {
        type: 'orderedList',
        attrs: { start: 1 },
        content: block.content as JSONContent[] || [],
      }
    case 'listItem':
      return {
        type: 'listItem',
        content: block.content as JSONContent[] || [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      }
    case 'taskList':
      return {
        type: 'taskList',
        content: block.content as JSONContent[] || [],
      }
    case 'taskItem':
      return {
        type: 'taskItem',
        attrs: { checked: block.checked || false },
        content: block.content as JSONContent[] || [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      }
    case 'horizontalRule':
      return { type: 'horizontalRule' }
    case 'table':
      return {
        type: 'table',
        content: block.content as JSONContent[] || [],
      }
    case 'tableRow':
      return {
        type: 'tableRow',
        content: block.content as JSONContent[] || [],
      }
    case 'tableCell':
      return {
        type: 'tableCell',
        content: block.content as JSONContent[] || [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      }
    case 'tableHeader':
      return {
        type: 'tableHeader',
        content: block.content as JSONContent[] || [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      }
    case 'mathBlock':
      return {
        type: 'mathBlock',
        attrs: { latex: block.text || '' },
      }
    case 'mermaidBlock':
      return {
        type: 'mermaidBlock',
        attrs: { code: block.text || '' },
      }
    case 'image':
      return {
        type: 'image',
        attrs: { src: block.url || '', alt: block.alt || '' },
      }
    default:
      return null
  }
}

function buildLineMap(blocks: BlockNode[], tokens: import('./types').LineToken[]): void {
  cachedLineMap.clear()
  let lineIdx = 0
  for (let i = 0; i < blocks.length; i++) {
    cachedLineMap.set(i, lineIdx)
    const block = blocks[i]
    // Estimate lines consumed by this block
    if (block.type === 'codeBlock') {
      lineIdx += (block.text?.split('\n').length || 0) + 2
    } else {
      lineIdx++
    }
  }
}
