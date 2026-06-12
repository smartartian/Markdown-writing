import { useUIStore } from '../../stores/ui.store'
import { FileTree } from './FileTree'
import { OutlinePanel } from './OutlinePanel'
import { cn } from '../../lib/utils'

interface SidebarProps {
  onOpenFile: (info: { path: string; name: string; content: string; lastModified: number }) => void
}

export function Sidebar({ onOpenFile }: SidebarProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarTab = useUIStore((s) => s.sidebarTab)

  return (
    <div
      className={cn(
        'flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden transition-all duration-200 ease-out',
        sidebarOpen ? 'w-60' : 'w-0 border-r-0',
      )}
    >
      {/* macOS traffic light spacer */}
      <div className="h-10 shrink-0" />

      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'files' ? <FileTree onOpenFile={onOpenFile} /> : <OutlinePanel />}
      </div>
    </div>
  )
}
