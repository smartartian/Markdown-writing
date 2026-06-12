import { useEditorStore, type HeadingItem } from '../../stores/editor.store'
import { cn } from '../../lib/utils'

export function OutlinePanel() {
  const headings = useEditorStore((s) => s.headings)

  const scrollToHeading = (item: HeadingItem) => {
    const editorEl = document.querySelector('.tiptap-editor') as HTMLElement
    if (!editorEl) return

    // Find the heading element by position in ProseMirror
    const pmEl = editorEl.querySelector('.ProseMirror') as HTMLElement
    if (!pmEl) return

    // Find heading by traversing ProseMirror DOM
    const allHeadings = pmEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
    // Use pos as index into the headings (approximate but works for click navigation)
    const idx = headings.indexOf(item)
    const target = allHeadings[idx] as HTMLElement
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (headings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
        暂无标题
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="px-3 py-1 mb-1">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          大纲
        </span>
      </div>
      {headings.map((item, index) => (
        <button
          key={index}
          onClick={() => scrollToHeading(item)}
          className={cn(
            'block w-full text-left px-2 py-0.5 text-sm hover:bg-[var(--bg-tertiary)] transition-colors truncate',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
          style={{ paddingLeft: `${item.level * 16 + 8}px` }}
        >
          {item.text}
        </button>
      ))}
    </div>
  )
}
