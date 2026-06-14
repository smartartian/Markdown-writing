import { create } from 'zustand'
import type { FileTreeNode } from '../../preload/index.d'

interface CurrentFile {
  path: string | null
  name: string | null
  content: string | null
  lastModified: number | null
}

interface FileStore {
  currentFile: CurrentFile
  isDirty: boolean
  fileTree: FileTreeNode[]
  rootPath: string | null

  setCurrentFile: (file: { path: string; name: string; content?: string; lastModified?: number }) => void
  markDirty: () => void
  markClean: () => void
  clearFile: () => void
  setFileTree: (tree: FileTreeNode[]) => void
  setRootPath: (path: string | null) => void
}

export const useFileStore = create<FileStore>((set) => ({
  currentFile: {
    path: null,
    name: null,
    content: null,
    lastModified: null,
  },
  isDirty: false,
  fileTree: [],
  rootPath: null,

  setCurrentFile: (file) =>
    set({
      currentFile: {
        path: file.path,
        name: file.name,
        content: file.content ?? null,
        lastModified: file.lastModified ?? Date.now(),
      },
      isDirty: false,
    }),

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  clearFile: () =>
    set({
      currentFile: { path: null, name: null, content: null, lastModified: null },
      isDirty: false,
    }),

  setFileTree: (tree) => set({ fileTree: tree }),
  setRootPath: (path) => set({ rootPath: path }),
}))
