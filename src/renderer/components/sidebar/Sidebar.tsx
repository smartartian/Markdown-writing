import { useUIStore } from '../../stores/ui.store'
import { FileTree } from './FileTree'
import { OutlinePanel } from './OutlinePanel'
import { PanelLeftClose } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  onOpenFile: (info: { path: string; name: string; content: string; lastModified: number }) => void
}

export function Sidebar({ onOpenFile }: SidebarProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarTab = useUIStore((s) => s.sidebarTab)
  const setSidebarTab = useUIStore((s) => s.setSidebarTab)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div
      data-sidebar
      className={cn(
        'flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden transition-[width] duration-300 ease-out',
        sidebarOpen ? 'w-60' : 'w-0 border-r-0',
      )}
    >
      {/* macOS traffic light spacer — draggable */}
      <div className="h-10 shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Header with tabs — Typora style */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setSidebarTab('files')}
            className={cn(
              'text-xs pb-0.5 border-b-2 transition-colors',
              sidebarTab === 'files'
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            文件
          </button>
          <button
            onClick={() => setSidebarTab('outline')}
            className={cn(
              'text-xs pb-0.5 border-b-2 transition-colors',
              sidebarTab === 'outline'
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            大纲
          </button>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div style={{ display: sidebarTab === 'files' ? 'block' : 'none', height: '100%' }}>
          <FileTree onOpenFile={onOpenFile} />
        </div>
        <div style={{ display: sidebarTab === 'outline' ? 'block' : 'none', height: '100%' }}>
          <OutlinePanel />
        </div>
      </div>
    </div>
  )
}
