import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from './stores/editor.store'
import { useFileStore } from './stores/file.store'
import { useUIStore } from './stores/ui.store'
import { useSettingsStore, type Theme } from './stores/settings.store'
import { WELCOME_CONTENT } from '../shared/defaults'
import { Sidebar } from './components/sidebar/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { MarkdownEditor } from './components/editor/MarkdownEditor'
import { SettingsPage } from './components/settings/SettingsPage'
import { useMenuActions } from './hooks/useMenuActions'
import { renderExportHtml } from './lib/markdown-parser'

export default function App() {
  const sourceContent = useEditorStore((s) => s.sourceContent)
  const setSourceContent = useEditorStore((s) => s.setSourceContent)
  const updateWordCount = useEditorStore((s) => s.updateWordCount)

  const currentFile = useFileStore((s) => s.currentFile)
  const setCurrentFile = useFileStore((s) => s.setCurrentFile)
  const markClean = useFileStore((s) => s.markClean)

  const showStatusBar = useUIStore((s) => s.showStatusBar)
  const showSettings = useUIStore((s) => s.showSettings)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  const [editorContent, setEditorContent] = useState(WELCOME_CONTENT)
  const initialContent = sourceContent || editorContent

  // Shared file open handler — sets both content and file info atomically
  const openFile = useCallback((info: { path: string; name: string; content: string; lastModified: number }) => {
    setEditorContent(info.content)
    setSourceContent(info.content)
    updateWordCount(info.content)
    setCurrentFile(info)
  }, [setSourceContent, updateWordCount, setCurrentFile])

  useEffect(() => {
    const savedTheme = localStorage.getItem('md-editor-theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'night' : 'github')
    }
    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const hasUserTheme = localStorage.getItem('md-editor-theme')
      if (!hasUserTheme) {
        setTheme(e.matches ? 'night' : 'github')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleOpenFile = useCallback(async () => {
    try {
      const file = await window.api.file.open()
      if (file) openFile(file)
    } catch (err) {
      console.error('打开文件失败:', err)
    }
  }, [openFile])

  const handleSave = useCallback(async () => {
    if (currentFile.path) {
      try {
        await window.api.file.save(currentFile.path, sourceContent)
        markClean()
      } catch (err) {
        console.error('保存失败:', err)
      }
    } else {
      await handleSaveAs()
    }
  }, [currentFile.path, sourceContent, markClean])

  const handleSaveAs = useCallback(async () => {
    try {
      const result = await window.api.file.saveAs(sourceContent)
      if (result) {
        setCurrentFile(result)
        markClean()
      }
    } catch (err) {
      console.error('另存为失败:', err)
    }
  }, [sourceContent, setCurrentFile, markClean])

  const handleNewFile = useCallback(async () => {
    if (currentFile.path) {
      const confirmed = await window.api.dialog.confirm('创建新文件？', '当前文件将被关闭，未保存的更改可能丢失。')
      if (!confirmed) return
    }
    const empty = ''
    setEditorContent(empty)
    setSourceContent(empty)
    // Set as untitled with name "未命名"
    setCurrentFile({ path: '', name: '未命名' })
    updateWordCount(empty)
  }, [currentFile.path, setSourceContent, setCurrentFile, updateWordCount])

  const handleExportPdf = useCallback(async () => {
    try {
      const html = renderExportHtml(sourceContent, currentFile.name || '未命名')
      await window.api.export.pdf(html)
    } catch (err) {
      console.error('PDF导出失败:', err)
    }
  }, [sourceContent, currentFile.name])

  const handleExportHtml = useCallback(async () => {
    try {
      const html = renderExportHtml(sourceContent, currentFile.name || '未命名')
      await window.api.export.html(html)
    } catch (err) {
      console.error('HTML导出失败:', err)
    }
  }, [sourceContent, currentFile.name])

  useMenuActions({
    onOpenFile: handleOpenFile,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onNewFile: handleNewFile,
    onExportPdf: handleExportPdf,
    onExportHtml: handleExportHtml,
  })

  // Listen for open-file event from main process (dock drop, "Open With")
  useEffect(() => {
    const unsubscribe = window.api.on.openFile(async (filePath: string) => {
      try {
        const file = await window.api.file.openPath(filePath)
        if (file) openFile(file)
      } catch { /* ignore */ }
    })
    return unsubscribe
  }, [])

  // Handle drag-and-drop of files from Finder (capture phase to beat ProseMirror)
  const sidebarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = document.getElementById('app-root')
    if (!el) return

    const isInsideSidebar = (x: number, y: number) => {
      const sidebarEl = el.querySelector('[data-sidebar]')
      if (!sidebarEl) return false
      const rect = sidebarEl.getBoundingClientRect()
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const files = Array.from(e.dataTransfer?.files || [])
      if (files.length === 0) return

      // Area detection: sidebar → load folder; elsewhere → open files
      const onSidebar = isInsideSidebar(e.clientX, e.clientY)

      for (let i = 0; i < files.length; i++) {
        const filePath = (files[i] as any).path as string | undefined
        if (!filePath) continue

        if (onSidebar) {
          // Sidebar drop: try loading as folder first
          try {
            const tree = await window.api.dir.list(filePath)
            if (Array.isArray(tree)) {
              useFileStore.getState().setFileTree(tree)
              useFileStore.getState().setRootPath(filePath)
              continue
            }
          } catch { /* not a directory, fall through */ }
        }

        // Open file: first file in current window, rest in new windows
        const info = await window.api.file.openPath(filePath).catch(() => null)
        if (!info) continue

        if (i === 0 && !currentFile.path) {
          // First file + empty window → open in current, load parent dir
          openFile(info)
          const parentDir = filePath.replace(/\/[^/]+$/, '')
          window.api.dir.list(parentDir).then(tree => {
            if (Array.isArray(tree)) {
              useFileStore.getState().setFileTree(tree)
              useFileStore.getState().setRootPath(parentDir)
            }
          }).catch(() => {})
        } else {
          // Subsequent files → new window
          await window.api.app.newWindow(filePath)
        }
      }
    }

    el.addEventListener('dragover', onDragOver, true)
    el.addEventListener('drop', onDrop, true)
    return () => {
      el.removeEventListener('dragover', onDragOver, true)
      el.removeEventListener('drop', onDrop, true)
    }
  }, [currentFile.path, openFile])

  if (showSettings) {
    return <SettingsPage />
  }

  return (
    <div id="app-root" className="flex flex-col h-screen bg-[var(--bg-primary)]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenFile={openFile} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor
              key={`editor-${currentFile.path || 'welcome'}`}
              initialContent={initialContent}
            />
          </div>
          {showStatusBar && <StatusBar />}
        </div>
      </div>
    </div>
  )
}
