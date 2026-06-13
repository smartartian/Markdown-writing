import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/core'

interface ImageToolbarProps {
  editor: Editor
}

export function ImageToolbar({ editor }: ImageToolbarProps) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [md, setMd] = useState('')

  useEffect(() => {
    const update = () => {
      try {
        const { view } = editor
        const { from, $from, empty } = view.state.selection

        // Must be a NodeSelection (not empty cursor)
        if (empty) {
          setShow(false)
          return
        }

        const node = $from.nodeAfter || view.state.doc.nodeAt(from)
        if (!node || node.type.name !== 'image') {
          setShow(false)
          return
        }

        const src = node.attrs.src || ''
        const alt = node.attrs.alt || ''
        const title = node.attrs.title || ''

        let markdown = `![${alt}](${src})`
        if (title) markdown = `![${alt}](${src} "${title}")`
        setMd(markdown)

        // Position toolbar above the image using coords
        const start = view.coordsAtPos(from)
        const editorRect = view.dom.getBoundingClientRect()
        setPos({
          top: start.top - editorRect.top - 28,
          left: start.left - editorRect.left,
        })
        setShow(true)
      } catch {
        setShow(false)
      }
    }

    editor.on('selectionUpdate', update)
    return () => { editor.off('selectionUpdate', update) }
  }, [editor])

  if (!show) return null

  return (
    <div
      className="absolute z-20 flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md shadow-md px-2 py-0.5 text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap select-all"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {md}
    </div>
  )
}
