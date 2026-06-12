import { useEditorStore } from '../../stores/editor.store'
import { useUIStore } from '../../stores/ui.store'
import { Code2, Eye } from 'lucide-react'

export function StatusBar() {
  const wordCount = useEditorStore((s) => s.wordCount)
  const charCount = useEditorStore((s) => s.charCount)
  const viewMode = useEditorStore((s) => s.viewMode)
  const requestSourceToggle = useEditorStore((s) => s.requestSourceToggle)
  const focusMode = useUIStore((s) => s.focusMode)
  const typewriterMode = useUIStore((s) => s.typewriterMode)

  return (
    <div className="flex items-center justify-between px-6 py-1.5 text-xs text-[var(--text-muted)] select-none">
      <div className="flex items-center gap-1">
        {focusMode && <span className="text-[var(--accent)]">专注</span>}
        {typewriterMode && <span className="text-[var(--accent)]">打字机</span>}
      </div>

      <div className="flex items-center gap-4">
        <span>{wordCount} 字</span>
        <span>{charCount} 字符</span>

        <button
          onClick={requestSourceToggle}
          className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
          title={viewMode === 'wysiwyg' ? '切换到源码模式 (Cmd+/)' : '切换到所见即所得 (Cmd+/)'}
        >
          {viewMode === 'wysiwyg' ? (
            <><Eye size={12} />预览</>
          ) : (
            <><Code2 size={12} />源码</>
          )}
        </button>
      </div>
    </div>
  )
}
