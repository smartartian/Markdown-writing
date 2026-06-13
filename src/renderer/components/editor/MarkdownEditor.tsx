import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { editorExtensions } from '../../lib/tipTap-extensions'
import { useEditorStore } from '../../stores/editor.store'
import { useFileStore } from '../../stores/file.store'
import { useUIStore } from '../../stores/ui.store'
import { useSettingsStore } from '../../stores/settings.store'
import { useAutoSave } from '../../hooks/useAutoSave'
import { WELCOME_CONTENT } from '../../../shared/defaults'
import { CodeMirrorEditor } from './CodeMirrorEditor'
import { ListTree, FolderOpen, Settings } from 'lucide-react'
import { SearchBar } from './SearchBar'
import type { JSONContent } from '../../lib/incremental-parser'
import { TableToolbar } from './TableToolbar'
import '../../assets/styles/editor.css'

interface MarkdownEditorProps {
  initialContent?: string
  onContentChange?: (markdown: string) => void
}

export function MarkdownEditor({ initialContent, onContentChange }: MarkdownEditorProps) {
  const setSourceContent = useEditorStore((s) => s.setSourceContent)
  const updateWordCount = useEditorStore((s) => s.updateWordCount)
  const setHeadings = useEditorStore((s) => s.setHeadings)
  const setViewModeStore = useEditorStore((s) => s.setViewMode)
  const sourceToggleCount = useEditorStore((s) => s.sourceToggleCount)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const markDirty = useFileStore((s) => s.markDirty)
  const currentFile = useFileStore((s) => s.currentFile)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarTab = useUIStore((s) => s.sidebarTab)
  const setSidebarTab = useUIStore((s) => s.setSidebarTab)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const focusMode = useUIStore((s) => s.focusMode)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const typewriterMode = useUIStore((s) => s.typewriterMode)
  const toggleTypewriterMode = useUIStore((s) => s.toggleTypewriterMode)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const [content, setContent] = useState(initialContent || WELCOME_CONTENT)
  const storeViewMode = useEditorStore((s) => s.viewMode)
  const [viewMode, setViewMode] = useState<'wysiwyg' | 'source'>(storeViewMode)
  const [showSearch, setShowSearch] = useState(false)
  const contentRef = useRef(content)
  contentRef.current = content

  const extractHeadings = useCallback((editorInstance: NonNullable<typeof editor>) => {
    const headings: Array<{ level: number; text: string; pos: number }> = []
    editorInstance.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({ level: node.attrs.level, text: node.textContent, pos })
      }
    })
    setHeadings(headings)
  }, [setHeadings])

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent || WELCOME_CONTENT,
    contentType: initialContent ? 'markdown' : 'markdown',
    onCreate: ({ editor: ed }) => {
      extractHeadings(ed)
      const md = ed.getMarkdown?.() ?? ''
      setSourceContent(md)
      updateWordCount(md)
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.getMarkdown?.() ?? ''
      setContent(md)
      setSourceContent(md)
      updateWordCount(md)
      markDirty()
      onContentChange?.(md)
      extractHeadings(ed)
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor${focusMode ? ' focus-mode' : ''}${typewriterMode ? ' typewriter-mode' : ''}`,
        spellcheck: 'false',
      },
      handlePaste: (view, event) => {
        // Check clipboard items for image data (files is for drag-drop, not paste)
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const blob = item.getAsFile()
            if (!blob) continue
            const reader = new FileReader()
            reader.onload = async () => {
              const dataUrl = reader.result as string
              const docPath = useFileStore.getState().currentFile.path
              const docDir = docPath ? docPath.replace(/\/[^/]+$/, '') : null
              try {
                const result = await window.api.file.saveImage(dataUrl, docDir)
                // Display: use file:// absolute path (Electron resolves correctly)
                const displaySrc = `file://${result.dir}/${result.filename}`
                const node = view.state.schema.nodes.image.create({ src: displaySrc })
                view.dispatch(view.state.tr.replaceSelectionWith(node))
                // Markdown: use relative path for portability
                const mdSrc = docDir ? `assets/${result.filename}` : `${result.dir}/${result.filename}`
                contentRef.current += `\n![image](${mdSrc})\n`
                setContent(contentRef.current)
              } catch {
                const node = view.state.schema.nodes.image.create({ src: dataUrl })
                view.dispatch(view.state.tr.replaceSelectionWith(node))
              }
            }
            reader.readAsDataURL(blob)
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0]
        if (!file?.type.startsWith('image/')) return false
        event.preventDefault()
        const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })
        const docPath = useFileStore.getState().currentFile.path
        const docDir = docPath ? docPath.replace(/\/[^/]+$/, '') : null

        // Typora-style: if file has a local path (Finder drag), copy directly
        const filePath = (file as any).path
        if (filePath) {
          window.api.file.copyImage(filePath, docDir).then((result) => {
            const displaySrc = `file://${result.dir}/${result.filename}`
            const node = view.state.schema.nodes.image.create({ src: displaySrc })
            view.dispatch(dropPos ? view.state.tr.insert(dropPos.pos, node) : view.state.tr.replaceSelectionWith(node))
          }).catch(() => {
            // Fallback: read as data URL
            const reader = new FileReader()
            reader.onload = () => {
              const node = view.state.schema.nodes.image.create({ src: reader.result as string })
              view.dispatch(dropPos ? view.state.tr.insert(dropPos.pos, node) : view.state.tr.replaceSelectionWith(node))
            }
            reader.readAsDataURL(file)
          })
        } else {
          // No local path (web drag), use data URL
          const reader = new FileReader()
          reader.onload = () => {
            const node = view.state.schema.nodes.image.create({ src: reader.result as string })
            view.dispatch(dropPos ? view.state.tr.insert(dropPos.pos, node) : view.state.tr.replaceSelectionWith(node))
          }
          reader.readAsDataURL(file)
        }
        return true
      },
    },
  })

  // Remove built-in heading InputRule
  useEffect(() => {
    if (!editor) return
    const headingExt = editor.extensionManager.extensions.find((e) => e.name === 'heading')
    if (headingExt && 'inputRules' in headingExt) {
      const rules = (headingExt as unknown as { inputRules: unknown[] }).inputRules
      if (Array.isArray(rules)) rules.length = 0
    }
  }, [editor])

  const getMarkdown = useCallback((): string => {
    if (editor && viewMode === 'wysiwyg') return editor.getMarkdown?.() ?? contentRef.current
    return contentRef.current
  }, [editor, viewMode])

  useAutoSave(getMarkdown)

  // Focus mode: dim non-active paragraphs
  useEffect(() => {
    if (!editor || !focusMode) return
    const update = () => {
      const el = editor.view.dom
      el.querySelectorAll('.focused-block').forEach((b) => b.classList.remove('focused-block'))
      const { $from } = editor.state.selection
      const pos = $from.before(1)
      const resolved = editor.view.domAtPos(Math.max(0, pos))
      const block = (resolved.node as HTMLElement).closest?.(
        'h1,h2,h3,h4,h5,h6,p,blockquote,pre,ul,ol,hr,table',
      )
      if (block instanceof HTMLElement) block.classList.add('focused-block')
    }
    editor.on('selectionUpdate', update)
    update()
    return () => { editor.off('selectionUpdate', update) }
  }, [editor, focusMode])

  // Typewriter mode: keep cursor vertically centered
  useEffect(() => {
    if (!editor || !typewriterMode) return
    const handler = () => {
      const { from } = editor.state.selection
      const node = editor.view.domAtPos(from).node as HTMLElement
      node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
    editor.on('selectionUpdate', handler)
    return () => { editor.off('selectionUpdate', handler) }
  }, [editor, typewriterMode])

  // Dynamically update editor CSS classes for focus/typewriter mode
  useEffect(() => {
    if (!editor) return
    const el = editor.view.dom
    el.classList.toggle('focus-mode', focusMode)
    el.classList.toggle('typewriter-mode', typewriterMode)
  }, [editor, focusMode, typewriterMode])

  const toggleSourceMode = useCallback(() => {
    if (viewMode === 'wysiwyg') {
      const md = editor?.getMarkdown?.() ?? contentRef.current
      setContent(md)
      setViewMode('source')
      setViewModeStore('source')
    } else {
      if (editor) {
        editor.commands.setContent(contentRef.current, { contentType: 'markdown' })
      }
      setViewMode('wysiwyg')
      setViewModeStore('wysiwyg')
    }
  }, [viewMode, editor, setViewModeStore])

  // Listen for toggle request from StatusBar (skip initial mount)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    toggleSourceMode()
  }, [sourceToggleCount])

  const handleToggleOutline = useCallback(() => {
    if (sidebarOpen && sidebarTab === 'outline') {
      toggleSidebar()
    } else {
      setSidebarTab('outline')
      if (!sidebarOpen) toggleSidebar()
    }
  }, [sidebarOpen, sidebarTab, setSidebarTab, toggleSidebar])

  const handleToggleFiles = useCallback(() => {
    if (sidebarOpen && sidebarTab === 'files') {
      toggleSidebar()
    } else {
      setSidebarTab('files')
      if (!sidebarOpen) toggleSidebar()
    }
  }, [sidebarOpen, sidebarTab, setSidebarTab, toggleSidebar])

  useEffect(() => {
    if (initialContent !== undefined && initialContent !== contentRef.current) {
      setContent(initialContent)
      if (editor && viewMode === 'wysiwyg') {
        const current = editor.getMarkdown?.() ?? ''
        if (initialContent !== current) {
          editor.commands.setContent(initialContent, { contentType: 'markdown' })
          // Extract headings after content is set externally
          setTimeout(() => extractHeadings(editor), 50)
        }
      }
    }
  }, [initialContent, editor, extractHeadings])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        toggleSourceMode()
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        toggleTypewriterMode()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSourceMode, toggleFocusMode, toggleTypewriterMode])

  const handleSourceChange = useCallback(
    (value: string) => {
      setContent(value)
      setSourceContent(value)
      updateWordCount(value)
      markDirty()
      onContentChange?.(value)
    },
    [setSourceContent, updateWordCount, markDirty, onContentChange],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Row 1: nav buttons + filename + settings */}
      <div className="flex items-center pl-20 pr-4 py-1 border-b border-[var(--border-color)]">
        <button
          onClick={handleToggleOutline}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors shrink-0 ${
            sidebarOpen && sidebarTab === 'outline'
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
          title="大纲"
        >
          <ListTree size={14} />
          大纲
        </button>
        <button
          onClick={handleToggleFiles}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors shrink-0 ${
            sidebarOpen && sidebarTab === 'files'
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
          title="文件"
        >
          <FolderOpen size={14} />
          文件
        </button>

        <div className="flex-1 text-center text-sm text-[var(--text-secondary)] truncate px-4">
          {currentFile.name || '未命名'}
        </div>

        <button
          onClick={toggleSettings}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-2 py-1 rounded shrink-0"
          title="设置"
        >
          <Settings size={14} />
          设置
        </button>
      </div>


      {showSearch && editor && <SearchBar editor={editor} onClose={() => setShowSearch(false)} />}

      <div className="flex-1 overflow-y-auto relative" style={{ fontSize: editorFontSize }}>
        {editor && viewMode === 'wysiwyg' && <TableToolbar editor={editor} />}
        {/* WYSIWYG — always mounted, CSS visibility toggle (Typora hybrid rendering) */}
        <div style={{ display: viewMode === 'wysiwyg' ? 'block' : 'none', height: '100%' }}>
          {editor && <EditorContent editor={editor} />}
        </div>
        {/* Source mode — always mounted, CSS visibility toggle */}
        <div style={{ display: viewMode === 'source' ? 'block' : 'none', height: '100%' }}>
          <CodeMirrorEditor value={content} onChange={handleSourceChange} />
        </div>
      </div>
    </div>
  )
}

