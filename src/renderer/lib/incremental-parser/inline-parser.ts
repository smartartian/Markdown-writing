/**
 * Inline parser: parses bold, italic, code, links, images within line text.
 * Uses a simple recursive descent pattern matching approach.
 */
import type { InlineToken } from './types'

// Patterns (in priority order)
const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/
const BOLD_RE = /\*\*(.+?)\*\*(?!\*)/
const ITALIC_RE = /\*(.+?)\*(?!\*)/
const STRIKE_RE = /~~(.+?)~~/
const CODE_RE = /`([^`]+)`/
const MATH_RE = /\$(.+?)\$/

type Pattern = { type: string; regex: RegExp; createToken: (match: RegExpExecArray) => InlineToken }

const PATTERNS: Pattern[] = [
  { type: 'image', regex: IMAGE_RE, createToken: (m) => ({ type: 'image', alt: m[1], src: m[2] }) },
  { type: 'link', regex: LINK_RE, createToken: (m) => ({ type: 'link', text: m[1], href: m[2] }) },
  { type: 'bold', regex: BOLD_RE, createToken: (m) => ({ type: 'bold', children: parseInline(m[1]) }) },
  { type: 'italic', regex: ITALIC_RE, createToken: (m) => ({ type: 'italic', children: parseInline(m[1]) }) },
  { type: 'strike', regex: STRIKE_RE, createToken: (m) => ({ type: 'strike', children: parseInline(m[1]) }) },
  { type: 'code', regex: CODE_RE, createToken: (m) => ({ type: 'code', text: m[1] }) },
  { type: 'mathInline', regex: MATH_RE, createToken: (m) => ({ type: 'mathInline', latex: m[1] }) },
]

/**
 * Parse a piece of inline text into a list of inline tokens.
 * Recursively handles nested formatting (e.g., bold within italic).
 */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let remaining = text
  let safety = 0

  while (remaining.length > 0 && safety++ < 1000) {
    let matched = false

    for (const pattern of PATTERNS) {
      pattern.regex.lastIndex = 0
      const match = pattern.regex.exec(remaining)
      if (match) {
        // Text before the match
        if (match.index > 0) {
          tokens.push({ type: 'text', text: remaining.slice(0, match.index) })
        }
        tokens.push(pattern.createToken(match))
        remaining = remaining.slice(match.index + match[0].length)
        matched = true
        break
      }
    }

    if (!matched) {
      tokens.push({ type: 'text', text: remaining })
      break
    }
  }

  return tokens
}
