import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { Search, X, ArrowUp, ArrowDown, Replace } from 'lucide-react'

interface SearchBarProps {
  editor: Editor
  onClose: () => void
}

export function SearchBar({ editor, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [replace, setReplace] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const decorationRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard: Esc to close, Enter to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const clearHighlights = useCallback(() => {
    decorationRef.current?.()
    decorationRef.current = null
    setCount(0)
    setCurrent(0)
  }, [])

  const doSearch = useCallback((q: string) => {
    clearHighlights()
    if (!q) return

    const doc = editor.state.doc
    const results: Array<{ from: number; to: number }> = []
    const lowerQ = q.toLowerCase()

    doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text || ''
        const lowerText = text.toLowerCase()
        let idx = lowerText.indexOf(lowerQ)
        while (idx !== -1) {
          results.push({ from: pos + idx + 1, to: pos + idx + q.length + 1 })
          idx = lowerText.indexOf(lowerQ, idx + 1)
        }
      }
    })

    setCount(results.length)
    if (results.length > 0) {
      setCurrent(1)
      navigateToResult(results[0])
    }
  }, [editor, clearHighlights])

  const navigateToResult = (range: { from: number; to: number }) => {
    editor.commands.setTextSelection(range)
    editor.commands.scrollIntoView()
  }

  const nextResult = () => {
    if (!query || count === 0) return
    doSearch(query)
    // Re-find and go to next
    const doc = editor.state.doc
    const lowerQ = query.toLowerCase()
    let idx = current
    let found = false
    doc.descendants((node, pos) => {
      if (found || !node.isText) return
      const text = node.text?.toLowerCase() || ''
      let textIdx = text.indexOf(lowerQ)
      while (textIdx !== -1) {
        idx++
        if (idx > count) idx = 1
        if (idx === current + 1 || (current === count && idx === 1)) {
          const range = { from: pos + textIdx + 1, to: pos + textIdx + query.length + 1 }
          navigateToResult(range)
          setCurrent(idx)
          found = true
          return
        }
        textIdx = text.indexOf(lowerQ, textIdx + 1)
      }
    })
  }

  const doReplace = () => {
    if (!query || count === 0) return
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to)
    if (selected.toLowerCase() === query.toLowerCase()) {
      editor.chain().focus().deleteSelection().insertContent(replace).run()
      doSearch(query)
    }
  }

  const doReplaceAll = () => {
    if (!query || count === 0) return
    const doc = editor.state.doc
    const lowerQ = query.toLowerCase()
    const replacements: Array<{ from: number; to: number }> = []
    doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text || ''
        const lowerText = text.toLowerCase()
        let idx = lowerText.indexOf(lowerQ)
        while (idx !== -1) {
          replacements.push({ from: pos + idx + 1, to: pos + idx + query.length + 1 })
          idx = lowerText.indexOf(lowerQ, idx + 1)
        }
      }
    })
    // Replace from end to start to preserve positions
    for (const r of replacements.reverse()) {
      editor.chain().setTextSelection(r).deleteSelection().insertContent(replace).run()
    }
    clearHighlights()
    setQuery('')
    setReplace('')
  }

  useEffect(() => {
    if (query) doSearch(query)
    else clearHighlights()
  }, [query, doSearch, clearHighlights])

  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md px-2 py-0.5 flex-1 max-w-sm">
        <Search size={13} className="text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="查找..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <span className="text-xs text-[var(--text-muted)]">
          {count > 0 ? `${current}/${count}` : query ? '0' : ''}
        </span>
        <button onClick={nextResult} className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="下一个 (Enter)">
          <ArrowDown size={13} />
        </button>
      </div>
      <button
        onClick={() => setShowReplace(!showReplace)}
        className={`text-xs px-1.5 py-0.5 rounded ${showReplace ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
      >
        <Replace size={13} />
      </button>
      {showReplace && (
        <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md px-2 py-0.5 flex-1 max-w-sm">
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="替换为..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <button onClick={doReplace} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1">替换</button>
          <button onClick={doReplaceAll} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1">全部</button>
        </div>
      )}
      <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <X size={14} />
      </button>
    </div>
  )
}
