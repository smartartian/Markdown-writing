/**
 * Line-level tokenizer: splits raw markdown into block-level tokens.
 */
import type { LineToken } from './types'

// Regex patterns
const HEADING_RE = /^(#{1,6})\s+(.+)$/
const CODE_FENCE_RE = /^(`{3,}|~{3,})\s*(\S*)\s*$/
const HR_RE = /^(?:---|\*\*\*|___)\s*$/
const BLOCKQUOTE_RE = /^>\s?(.*)$/
const UNORDERED_LIST_RE = /^(\s*)[-*+]\s+(.*)$/
const ORDERED_LIST_RE = /^(\s*)(\d+)\.\s+(.*)$/
const TASK_LIST_RE = /^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/
const TABLE_ROW_RE = /^\|(.+)\|$/
const TABLE_SEP_RE = /^\|(\s*:?-+:?\s*\|)+\s*$/
const MATH_BLOCK_RE = /^\$\$\s*$/
const EMPTY_RE = /^\s*$/

/**
 * Convert raw markdown text into a stream of line tokens.
 */
export function tokenize(markdown: string): LineToken[] {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const tokens: LineToken[] = []
  let inCodeFence = false
  let fenceChar = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    const indent = line.length - trimmed.length

    // Code fence state
    if (inCodeFence) {
      const fenceMatch = line.match(CODE_FENCE_RE)
      if (fenceMatch && fenceMatch[1].startsWith(fenceChar)) {
        inCodeFence = false
        tokens.push({ type: 'code_fence', indent: 0, content: '', meta: 'end' })
        continue
      }
      tokens.push({ type: 'code_line', indent, content: line })
      continue
    }

    // Potential code fence start
    const fenceMatch = trimmed.match(CODE_FENCE_RE)
    if (fenceMatch) {
      inCodeFence = true
      fenceChar = fenceMatch[1][0]
      tokens.push({ type: 'code_fence', indent: 0, content: '', language: fenceMatch[2] || '', meta: 'start' })
      continue
    }

    // Math block
    if (trimmed.match(MATH_BLOCK_RE)) {
      tokens.push({ type: 'math_block', indent: 0, content: '' })
      continue
    }

    // Empty line
    if (trimmed.match(EMPTY_RE)) {
      tokens.push({ type: 'empty', indent: 0, content: '' })
      continue
    }

    // Horizontal rule
    if (trimmed.match(HR_RE)) {
      tokens.push({ type: 'horizontal_rule', indent: 0, content: '' })
      continue
    }

    // Heading
    const headingMatch = trimmed.match(HEADING_RE)
    if (headingMatch) {
      tokens.push({ type: 'heading', indent: 0, content: headingMatch[2], level: headingMatch[1].length })
      continue
    }

    // Task list
    const taskMatch = line.match(TASK_LIST_RE)
    if (taskMatch) {
      tokens.push({ type: 'task_item', indent: taskMatch[1].length, content: taskMatch[3], checked: taskMatch[2].toLowerCase() === 'x' })
      continue
    }

    // Unordered list
    const ulMatch = line.match(UNORDERED_LIST_RE)
    if (ulMatch) {
      tokens.push({ type: 'list_item', indent: ulMatch[1].length, content: ulMatch[2] })
      continue
    }

    // Ordered list
    const olMatch = line.match(ORDERED_LIST_RE)
    if (olMatch) {
      tokens.push({ type: 'list_item', indent: olMatch[1].length, content: olMatch[3], ordered: true })
      continue
    }

    // Blockquote
    const bqMatch = line.match(BLOCKQUOTE_RE)
    if (bqMatch) {
      tokens.push({ type: 'blockquote', indent: 0, content: bqMatch[1] })
      continue
    }

    // Table
    if (trimmed.match(TABLE_SEP_RE)) {
      tokens.push({ type: 'table_sep', indent: 0, content: trimmed })
      continue
    }
    if (trimmed.match(TABLE_ROW_RE)) {
      tokens.push({ type: 'table_row', indent: 0, content: trimmed })
      continue
    }

    // Default: paragraph
    tokens.push({ type: 'paragraph', indent: 0, content: trimmed })
  }

  return tokens
}
