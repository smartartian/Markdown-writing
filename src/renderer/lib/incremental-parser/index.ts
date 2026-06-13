/**
 * Incremental Markdown Parser — public API.
 *
 * Provides a marked-compatible wrapper so it can be injected into
 * TipTap's Markdown extension: Markdown.configure({ marked: ourParser })
 */
export { parse, toJSONContent, incrementalParse } from './parser'
export { tokenize } from './tokenizer'
export { parseBlocks } from './block-parser'
export { parseInline } from './inline-parser'
export type { JSONContent } from './parser'
export type { BlockNode, InlineToken, LineToken } from './types'
