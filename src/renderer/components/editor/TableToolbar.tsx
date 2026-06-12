import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/core'
import { Plus, Trash2, Table2 } from 'lucide-react'

interface TableToolbarProps {
  editor: Editor
}

export function TableToolbar({ editor }: TableToolbarProps) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const update = () => {
      const isInTable = editor.isActive('table')
      if (!isInTable) { setShow(false); return }

      const { view } = editor
      const { from } = view.state.selection
      const dom = view.domAtPos(from).node as HTMLElement
      const table = dom.closest('table')
      if (!table) { setShow(false); return }

      const editorRect = view.dom.getBoundingClientRect()
      const tableRect = table.getBoundingClientRect()
      setPos({
        top: tableRect.top - editorRect.top - 32,
        left: tableRect.left - editorRect.left,
      })
      setShow(true)
    }

    editor.on('selectionUpdate', update)
    return () => { editor.off('selectionUpdate', update) }
  }, [editor])

  if (!show) return null

  return (
    <div
      className="absolute z-20 flex items-center gap-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md shadow-md px-1 py-0.5"
      style={{ top: pos.top, left: pos.left }}
    >
      <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="左侧插入列"><Plus size={13} /></button>
      <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="右侧插入列"><Table2 size={13} /></button>
      <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="删除列"><Trash2 size={13} /></button>
      <span className="w-px h-4 bg-[var(--border-color)]" />
      <button onClick={() => editor.chain().focus().addRowBefore().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="上方插入行"><Plus size={13} className="rotate-90" /></button>
      <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="下方插入行"><Plus size={13} /></button>
      <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="删除行"><Trash2 size={13} /></button>
    </div>
  )
}
