import { useEffect } from 'react'
import { useUIStore } from '../stores/ui.store'
import { useEditorStore } from '../stores/editor.store'

interface MenuActionCallbacks {
  onOpenFile: () => void
  onSave: () => void
  onSaveAs: () => void
  onNewFile: () => void
  onExportPdf: () => void
  onExportHtml: () => void
}

export function useMenuActions(callbacks: MenuActionCallbacks): void {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const toggleTypewriterMode = useUIStore((s) => s.toggleTypewriterMode)
  const requestParagraphAction = useEditorStore((s) => s.requestParagraphAction)

  useEffect(() => {
    const unsubscribe = window.api.on.menuAction((action: string) => {
      switch (action) {
        case 'file:open':
          callbacks.onOpenFile()
          break
        case 'file:save':
          callbacks.onSave()
          break
        case 'file:save-as':
          callbacks.onSaveAs()
          break
        case 'file:new':
          callbacks.onNewFile()
          break
        case 'export:pdf':
          callbacks.onExportPdf()
          break
        case 'export:html':
          callbacks.onExportHtml()
          break
        case 'toggle-sidebar':
          toggleSidebar()
          break
        case 'toggle-focus':
          toggleFocusMode()
          break
        case 'toggle-typewriter':
          toggleTypewriterMode()
          break
        case 'window:new':
          window.api.app.newWindow()
          break
        default:
          if (action.startsWith('paragraph:')) {
            requestParagraphAction(action)
          }
          break
      }
    })

    return unsubscribe
  }, [callbacks, toggleSidebar, toggleFocusMode, toggleTypewriterMode, requestParagraphAction])
}
