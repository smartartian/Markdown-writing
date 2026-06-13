/**
 * Block parser: converts line tokens into an AST of BlockNodes.
 * Handles nesting (lists, blockquotes, code blocks, tables).
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
        i++
        while (i < tokens.length && (tokens[i].type === 'blockquote' || tokens[i].type === 'paragraph')) {
          if (tokens[i].type === 'blockquote') {
            quoteLines.push({ ...tokens[i], type: 'paragraph' })
          } else {
            quoteLines.push(tokens[i])
          }
          i++
          // Stop at empty line
          if (i < tokens.length && tokens[i].type === 'empty') { i++; break }
        }
        blocks.push({
          type: 'blockquote',
          content: parseBlocks(quoteLines).flatMap(b => b.content || []),
        })
        break
      }

      case 'list_item': {
        const listItems = parseListItems(tokens, i)
        const isOrdered = listItems[0]?.ordered
        blocks.push({
          type: isOrdered ? 'orderedList' : 'bulletList',
          content: listItems.map(item => ({
            type: 'listItem' as const,
            content: [{ type: 'text', text: item.content }],
          })),
        })
        i = listItems[listItems.length - 1]?.endIndex ?? i + 1
        break
      }

      case 'task_item': {
        const taskItems = parseTaskItems(tokens, i)
        blocks.push({
          type: 'taskList',
          content: taskItems.map(item => ({
            type: 'taskItem' as const,
            checked: item.checked,
            content: [{ type: 'text', text: item.content }],
          })),
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

      case 'math_block': {
        blocks.push({ type: 'mathBlock', text: token.content })
        i++
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
          const textTokens = inlines.filter(t => t.type !== 'image')
          const imageTokens = inlines.filter(t => t.type === 'image')
          // Add images as standalone blocks
          for (const img of imageTokens) {
            if (img.type === 'image') {
              blocks.push({ type: 'image', url: img.src, alt: img.alt })
            }
          }
          // Add paragraph with remaining text content
          if (textTokens.length > 0) {
            blocks.push({ type: 'paragraph', content: textTokens.map(c => inlineToTextNode(c)).flat() })
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

interface ListItemData extends LineToken {
  endIndex: number
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

  // Skip separator row
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

function inlineToTextNode(token: InlineToken): TN[] {
  switch (token.type) {
    case 'text':
      return [{ type: 'text', text: token.text }]
    case 'bold':
      return [{ type: 'text', text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'bold' }] }]
    case 'italic':
      return [{ type: 'text', text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'italic' }] }]
    case 'strike':
      return [{ type: 'text', text: token.children?.map(c => c.type === 'text' ? c.text : '').join('') || '', marks: [{ type: 'strike' }] }]
    case 'code':
      return [{ type: 'text', text: token.text, marks: [{ type: 'code' }] }]
    case 'link':
      return [{ type: 'text', text: token.text, marks: [{ type: 'link', attrs: { href: token.href } }] }]
    case 'image':
      // Images are block-level, not inline in our output (handled by schema)
      return []
    case 'mathInline':
      return [{ type: 'text', text: token.latex }]
    case 'hardBreak':
      return []
  }
}
