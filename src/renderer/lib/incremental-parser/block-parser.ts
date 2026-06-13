/**
 * Block parser: converts line tokens into an AST of BlockNodes.
 * Handles nesting (lists, blockquotes, code blocks, tables, math).
 */
import type { BlockNode, LineToken, InlineToken, TextNode as TN } from './types'
import { parseInline } from './inline-parser'

/**
 * Parse line tokens into a block AST.
 */
export function parseBlocks(tokens: LineToken[]): BlockNode[] {
  const blocks: BlockNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    switch (token.type) {
      case 'heading': {
        blocks.push({
          type: 'heading',
          level: token.level,
          content: [{ type: 'text', text: token.content }],
        })
        i++
        break
      }

      case 'code_fence': {
        if (token.meta === 'start') {
          const codeLines: string[] = []
          const lang = token.language || undefined
          i++
          while (i < tokens.length) {
            if (tokens[i].type === 'code_fence' && tokens[i].meta === 'end') { i++; break }
            codeLines.push(tokens[i].content)
            i++
          }
          blocks.push({
            type: 'codeBlock',
            language: lang,
            text: codeLines.join('\n'),
          })
        } else {
          i++
        }
        break
      }

      case 'blockquote': {
        const quoteLines: LineToken[] = []
        // Include the first blockquote line
        quoteLines.push({ ...token, type: 'paragraph' })
        i++
        while (i < tokens.length && (tokens[i].type === 'blockquote' || tokens[i].type === 'paragraph')) {
          if (tokens[i].type === 'blockquote') {
            quoteLines.push({ ...tokens[i], type: 'paragraph' })
          } else {
            quoteLines.push(tokens[i])
          }
          i++
          if (i < tokens.length && tokens[i].type === 'empty') { i++; break }
        }
        const bqContent = parseBlocks(quoteLines).flatMap(b => {
          if (b.type === 'paragraph' && b.content) return [{ type: 'paragraph' as const, content: b.content }]
          return []
        })
        blocks.push({ type: 'blockquote', content: bqContent })
        break
      }

      case 'list_item': {
        const listItems = parseListItems(tokens, i)
        const isOrdered = listItems[0]?.ordered
        blocks.push({
          type: isOrdered ? 'orderedList' : 'bulletList',
          content: buildNestedListItems(listItems, isOrdered),
        })
        i = listItems[listItems.length - 1]?.endIndex ?? i + 1
        break
      }

      case 'task_item': {
        const taskItems = parseTaskItems(tokens, i)
        blocks.push({
          type: 'taskList',
          content: buildNestedTaskItems(taskItems),
        })
        i = taskItems[taskItems.length - 1]?.endIndex ?? i + 1
        break
      }

      case 'table_row': {
        const table = parseTable(tokens, i)
        blocks.push(table)
        i = table._endIndex ?? i + 1
        break
      }

      case 'horizontal_rule': {
        blocks.push({ type: 'horizontalRule' })
        i++
        break
      }

      // Single-line math block: $$\frac{-b}{2a}$$
      case 'math_block': {
        blocks.push({ type: 'mathBlock', text: token.content })
        i++
        break
      }

      // Multi-line math block start: $$ on its own line
      case 'math_block_start': {
        const mathLines: string[] = []
        i++
        while (i < tokens.length) {
          if (tokens[i].type === 'math_block_end') { i++; break }
          if (tokens[i].type === 'math_content') {
            mathLines.push(tokens[i].content)
          }
          i++
        }
        blocks.push({ type: 'mathBlock', text: mathLines.join('\n') })
        break
      }

      case 'empty': {
        i++
        break
      }

      // paragraph
      default: {
        // Collect consecutive paragraph lines
        const lines: string[] = []
        while (i < tokens.length && (tokens[i].type === 'paragraph' || tokens[i].type === 'text')) {
          lines.push(tokens[i].content)
          i++
        }
        if (lines.length > 0) {
          const text = lines.join('\n')
          const inlines = parseInline(text)
          // Separate images from text content
          const nonImage = inlines.filter(t => t.type !== 'image')
          const imageTokens = inlines.filter(t => t.type === 'image')
          for (const img of imageTokens) {
            if (img.type === 'image') {
              blocks.push({ type: 'image', url: img.src, alt: img.alt })
            }
          }
          if (nonImage.length > 0) {
            blocks.push({ type: 'paragraph', content: inlineNodesToContent(nonImage) })
          }
        } else {
          i++
        }
        break
      }
    }
  }

  return blocks
}

/** Convert inline tokens to content nodes (text, mathInline, etc.) */
function inlineNodesToContent(tokens: InlineToken[]): (TN | { type: string; attrs?: Record<string, unknown>; text?: string; marks?: TN['marks'] })[] {
  return tokens.map(token => {
    switch (token.type) {
      case 'text':
        return { type: 'text' as const, text: token.text }
      case 'bold':
        return { type: 'text' as const, text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'bold' as const }] }
      case 'italic':
        return { type: 'text' as const, text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'italic' as const }] }
      case 'strike':
        return { type: 'text' as const, text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'strike' as const }] }
      case 'code':
        return { type: 'text' as const, text: token.text, marks: [{ type: 'code' as const }] }
      case 'link':
        return { type: 'text' as const, text: token.text, marks: [{ type: 'link' as const, attrs: { href: token.href } }] }
      case 'mathInline':
        return { type: 'mathInline', attrs: { latex: token.latex } }
      case 'hardBreak':
        return { type: 'hardBreak' } as any
      case 'image':
        return { type: 'text' as const, text: '' }
    }
  })
}

interface ListItemData extends LineToken {
  endIndex: number
}

/** Build nested list structure from flat list items based on indentation. */
function buildNestedListItems(items: ListItemData[], isOrdered: boolean): BlockNode[] {
  const baseIndent = Math.min(...items.map(i => i.indent))
  return groupItems(items, baseIndent, isOrdered, false)
}

function buildNestedTaskItems(items: ListItemData[]): BlockNode[] {
  const baseIndent = Math.min(...items.map(i => i.indent))
  return groupItems(items, baseIndent, false, true)
}

function groupItems(items: ListItemData[], baseIndent: number, isOrdered: boolean, isTask: boolean): BlockNode[] {
  const result: BlockNode[] = []
  let i = 0

  while (i < items.length) {
    const item = items[i]
    const inlineContent = parseInline(item.content)
    const para = { type: 'paragraph' as const, content: inlineNodesToContent(inlineContent) }
    const children: BlockNode[] = []

    // Collect nested items (indent > baseIndent) that follow this item
    let j = i + 1
    while (j < items.length && items[j].indent > baseIndent) {
      j++
    }
    if (j > i + 1) {
      const nested = items.slice(i + 1, j)
      const nestedBase = Math.min(...nested.map(it => it.indent))
      const nestedIsOrdered = nested[0]?.ordered ?? false
      const nestedIsTask = nested[0]?.type === 'task_item'
      if (nestedIsTask) {
        children.push({ type: 'taskList', content: groupItems(nested, nestedBase, false, true) })
      } else {
        children.push({ type: nestedIsOrdered ? 'orderedList' : 'bulletList', content: groupItems(nested, nestedBase, nestedIsOrdered, false) })
      }
    }

    if (isTask) {
      result.push({
        type: 'taskItem' as const,
        checked: item.checked ?? false,
        content: [para, ...children],
      })
    } else {
      result.push({
        type: 'listItem' as const,
        content: [para, ...children],
      })
    }

    i = j
  }

  return result
}

function parseListItems(tokens: LineToken[], start: number): ListItemData[] {
  const items: ListItemData[] = []
  let i = start
  while (i < tokens.length && tokens[i].type === 'list_item') {
    const item = tokens[i] as ListItemData
    item.endIndex = i + 1
    items.push(item)
    i++
    if (i < tokens.length && tokens[i].type === 'empty') { item.endIndex = i + 1; i++; break }
  }
  return items
}

function parseTaskItems(tokens: LineToken[], start: number): ListItemData[] {
  const items: ListItemData[] = []
  let i = start
  while (i < tokens.length && tokens[i].type === 'task_item') {
    const item = tokens[i] as ListItemData
    item.endIndex = i + 1
    items.push(item)
    i++
    if (i < tokens.length && tokens[i].type === 'empty') { item.endIndex = i + 1; i++; break }
  }
  return items
}

interface ParsedTable extends BlockNode {
  _endIndex: number
}

function parseTable(tokens: LineToken[], start: number): ParsedTable {
  const rows: BlockNode[] = []
  const cells: BlockNode[] = []
  const cellTexts = tokens[start].content.split('|').map(s => s.trim()).filter(Boolean)
  for (const cell of cellTexts) {
    cells.push({ type: 'tableHeader', content: [{ type: 'text', text: cell }] })
  }
  rows.push({ type: 'tableRow', content: cells })
  let i = start + 1

  if (i < tokens.length && tokens[i].type === 'table_sep') {
    i++
  }

  while (i < tokens.length && tokens[i].type === 'table_row') {
    const rowCells: BlockNode[] = []
    const texts = tokens[i].content.split('|').map(s => s.trim()).filter(Boolean)
    for (const cell of texts) {
      rowCells.push({ type: 'tableCell', content: [{ type: 'text', text: cell }] })
    }
    rows.push({ type: 'tableRow', content: rowCells })
    i++
  }

  return { type: 'table', content: rows, _endIndex: i }
}
