import { useState, useCallback, useRef, useEffect } from 'react'
import { useFileStore } from '../../stores/file.store'
import type { FileTreeNode } from '../../../preload/index.d'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, RefreshCw, FilePlus, FolderPlus, Trash2, Pencil, FolderOpen as FolderOpenIcon, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ContextMenu {
  x: number
  y: number
  targetPath: string
  targetName: string
  targetIsDir: boolean
}

interface FileTreeProps {
  onOpenFile: (info: { path: string; name: string; content: string; lastModified: number }) => void
}

export function FileTree({ onOpenFile }: FileTreeProps) {
  const fileTree = useFileStore((s) => s.fileTree)
  const setFileTree = useFileStore((s) => s.setFileTree)
  const rootPath = useFileStore((s) => s.rootPath)
  const setRootPath = useFileStore((s) => s.setRootPath)
  const currentFile = useFileStore((s) => s.currentFile)
  const setCurrentFile = useFileStore((s) => s.setCurrentFile)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [renaming, setRenaming] = useState<{ path: string; name: string } | null>(null)
  const [creatingFile, setCreatingFile] = useState<{ parentDir: string; defaultName: string } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const renameInputRef = useRef<HTMLInputElement>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true)
    try {
      const tree = await window.api.dir.list(dirPath)
      setFileTree(tree)
      setRootPath(dirPath)
    } catch {
      console.error('读取文件夹失败')
    } finally {
      setLoading(false)
    }
  }, [setFileTree])

  const handleSelectFolder = async () => {
    const folderPath = await window.api.dialog.openFolder()
    if (folderPath) await loadDirectory(folderPath)
  }

  const handleRefresh = () => {
    if (rootPath) loadDirectory(rootPath)
  }

  const handleOpenFile = useCallback(async (path: string) => {
    try {
      const file = await window.api.file.openPath(path)
      if (file) {
        onOpenFile({ path: file.path, name: file.name, content: file.content, lastModified: file.lastModified })
      }
    } catch {
      console.error('打开文件失败')
    }
  }, [onOpenFile])

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  const toggleSelect = (path: string, isDir: boolean, metaKey: boolean) => {
    if (isDir) return // don't select directories
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (metaKey) {
        next.has(path) ? next.delete(path) : next.add(path)
      } else {
        next.clear()
        next.add(path)
      }
      return next
    })
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return
    const paths = Array.from(selectedFiles)
    const result = await window.api.file.batchDelete(paths)
    if (result.deleted.includes(currentFile.path)) {
      setCurrentFile({ path: '', name: '' })
    }
    if (rootPath) loadDirectory(rootPath)
    setSelectedFiles(new Set())
  }

  const handleContextMenu = (e: React.MouseEvent, path: string, name: string, isDir: boolean) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, targetPath: path, targetName: name, targetIsDir: isDir })
  }

  useEffect(() => {
    const handler = () => setContextMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renaming])

  useEffect(() => {
    if (creatingFile && newFileInputRef.current) {
      newFileInputRef.current.focus()
      newFileInputRef.current.select()
    }
  }, [creatingFile])


  const startNewFile = (parentDir: string) => {
    // Find an available file name: 未命名, 未命名1, 未命名2, ...
    // Check existing files in the target directory
    const children = parentDir === rootPath
      ? fileTree  // root dir — check top-level items
      : (findDirNode(fileTree, parentDir)?.children || [])
    const existing = new Set(children.filter(n => !n.isDirectory).map(n => n.name))
    let name = '未命名'
    let i = 1
    while (existing.has(`${name}.md`)) {
      name = `未命名${i}`
      i++
    }
    setCreatingFile({ parentDir, defaultName: name })
    setContextMenu(null)
  }

  const submitNewFile = async () => {
    if (!creatingFile || !newFileInputRef.current) return
    let baseName = newFileInputRef.current.value.trim()
    if (!baseName) {
      setCreatingFile(null)
      return
    }
    // Strip .md suffix if user typed it
    if (baseName.endsWith('.md')) baseName = baseName.slice(0, -3)
    if (!baseName) {
      setCreatingFile(null)
      return
    }
    await window.api.file.create(creatingFile.parentDir, baseName)
    if (rootPath) loadDirectory(rootPath)
    setCreatingFile(null)
  }

  const handleNewFolder = async () => {
    if (!contextMenu) return
    const parentPath = contextMenu.targetIsDir ? contextMenu.targetPath : contextMenu.targetPath.replace(/\/[^/]+$/, '')
    const name = `新建文件夹${Date.now().toString(36)}`
    await window.api.dir.create(parentPath, name)
    if (rootPath) loadDirectory(rootPath)
    setContextMenu(null)
  }

  const handleDelete = async () => {
    if (!contextMenu) return
    const deleted = await window.api.file.delete(contextMenu.targetPath)
    if (deleted && rootPath) {
      if (currentFile.path === contextMenu.targetPath) {
        setCurrentFile({ path: '', name: '' })
      }
      loadDirectory(rootPath)
    }
    setContextMenu(null)
  }

  const startRename = (path: string, name: string) => {
    setRenaming({ path, name })
    setContextMenu(null)
  }

  const submitRename = async () => {
    if (!renaming || !renameInputRef.current) return
    const newName = renameInputRef.current.value.trim()
    if (!newName || newName === renaming.name) {
      setRenaming(null)
      return
    }
    try {
      const result = await window.api.file.rename(renaming.path, newName)
      if (currentFile.path === renaming.path) {
        setCurrentFile({ ...currentFile, path: result.path, name: result.name })
      }
      if (rootPath) loadDirectory(rootPath)
    } catch {
      console.error('重命名失败')
    }
    setRenaming(null)
  }

  const renderFileName = (name: string) => name.replace(/\.(md|markdown|txt)$/i, '')

  const renderNode = (node: FileTreeNode, depth: number) => {
    const isOpen = openFolders.has(node.path)
    const isActive = currentFile.path === node.path
    const isRenaming = renaming?.path === node.path

    if (node.isDirectory) {
      return (
        <div key={node.path}>
          {isRenaming ? (
            <div style={{ paddingLeft: `${depth * 16 + 8}px` }} className="px-2 py-0.5">
              <input
                ref={renameInputRef}
                defaultValue={node.name}
                onBlur={submitRename}
                onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenaming(null) }}
                className="w-full text-sm bg-[var(--bg-tertiary)] border border-[var(--accent)] rounded px-1 py-0 outline-none text-[var(--text-primary)]"
              />
            </div>
          ) : (
            <button
              onClick={() => toggleFolder(node.path)}
              onContextMenu={(e) => handleContextMenu(e, node.path, node.name, true)}
              onDoubleClick={() => startRename(node.path, node.name)}
              className="flex items-center gap-1 w-full px-2 py-0.5 text-left text-sm hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              {isOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
              {isOpen ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
              <span className="truncate">{node.name}</span>
            </button>
          )}
          {isOpen && node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      )
    }

    return (
      <div key={node.path}>
        {isRenaming ? (
          <div style={{ paddingLeft: `${depth * 16 + 8}px` }} className="px-2 py-0.5">
            <input
              ref={renameInputRef}
              defaultValue={node.name}
              onBlur={submitRename}
              onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenaming(null) }}
              className="w-full text-sm bg-[var(--bg-tertiary)] border border-[var(--accent)] rounded px-1 py-0 outline-none text-[var(--text-primary)]"
            />
          </div>
        ) : (
          <button
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) {
                toggleSelect(node.path, false, true)
              } else {
                if (selectedFiles.size > 0) {
                  toggleSelect(node.path, false, false)
                }
                handleOpenFile(node.path)
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node.path, node.name, false)}
            onDoubleClick={() => startRename(node.path, node.name)}
            className={cn(
              'flex items-center gap-1 w-full px-2 py-0.5 text-left text-sm hover:bg-[var(--bg-tertiary)] transition-colors group',
              isActive ? 'bg-[var(--bg-tertiary)] text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]',
              selectedFiles.has(node.path) ? 'bg-[var(--accent)]/15 ring-1 ring-inset ring-[var(--accent)]/30' : '',
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {selectedFiles.has(node.path) ? (
              <Check size={14} className="shrink-0 text-[var(--accent)]" />
            ) : (
              <FileText size={14} className="shrink-0" />
            )}
            <span className="truncate">{renderFileName(node.name)}</span>
          </button>
        )}
      </div>
    )
  }

  const mdFileCount = countMdFiles(fileTree)

  return (
    <div className="flex flex-col h-full">
      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1" onClick={(e) => { if (e.target === e.currentTarget) setSelectedFiles(new Set()) }}>
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">读取中...</div>
        ) : rootPath ? (
          <>
            <div className="px-3 py-1 mb-1">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {mdFileCount} 个文档
              </span>
            </div>
            {fileTree.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">未找到 Markdown 文件</div>
            ) : (
              fileTree.map((node) => renderNode(node, 0))
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">点击下方按钮选择一个文件夹</div>
        )}
      </div>

      {/* Selection action bar */}
      {selectedFiles.size > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{selectedFiles.size} 个文件已选中</span>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={12} />
              删除选中
            </button>
          </div>
        </div>
      )}

      {/* Folder selector — moved to bottom */}
      <div className="px-3 py-3 border-t border-[var(--border-color)]">
        {rootPath && (
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-[var(--text-muted)] truncate flex-1" title={rootPath}>
              {rootPath.split('/').pop() || rootPath}
            </div>
            <button onClick={handleRefresh} className="p-0.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors shrink-0" title="刷新">
              <RefreshCw size={13} />
            </button>
          </div>
        )}
        <button
          onClick={handleSelectFolder}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <FolderOpenIcon size={15} />
          选择文件夹
        </button>
        {rootPath && (
          creatingFile ? (
            <div className="flex items-center gap-1 mt-1.5 px-3 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--accent)]">
              <input
                ref={newFileInputRef}
                key={creatingFile.defaultName}
                defaultValue={creatingFile.defaultName}
                onBlur={submitNewFile}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNewFile()
                  if (e.key === 'Escape') setCreatingFile(null)
                }}
                className="flex-1 text-xs bg-transparent border-none outline-none text-[var(--text-primary)]"
              />
              <span className="text-xs text-[var(--text-muted)] shrink-0">.md</span>
            </div>
          ) : (
            <button
              onClick={() => startNewFile(rootPath)}
              className="flex items-center gap-2 w-full mt-1.5 px-3 py-1.5 rounded-md text-[var(--text-muted)] text-xs hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <FilePlus size={13} />
              新建 Markdown 文件
            </button>
          )
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => startRename(contextMenu.targetPath, contextMenu.targetName)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Pencil size={14} />
            重命名
          </button>
          <button
            onClick={() => {
              const dirPath = contextMenu.targetIsDir ? contextMenu.targetPath : contextMenu.targetPath.replace(/\/[^/]+$/, '')
              if (dirPath) startNewFile(dirPath)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <FilePlus size={14} />
            新建 Markdown 文件
          </button>
          <button
            onClick={handleNewFolder}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <FolderPlus size={14} />
            新建文件夹
          </button>
          <div className="border-t border-[var(--border-color)] my-0.5" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}
    </div>
  )
}

function findDirNode(nodes: FileTreeNode[], targetPath: string): FileTreeNode | null {
  for (const node of nodes) {
    if (node.path === targetPath && node.isDirectory) return node
    if (node.children) {
      const found = findDirNode(node.children, targetPath)
      if (found) return found
    }
  }
  return null
}

function countMdFiles(nodes: FileTreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    if (node.isDirectory && node.children) count += countMdFiles(node.children)
    else if (!node.isDirectory) count++
  }
  return count
}
