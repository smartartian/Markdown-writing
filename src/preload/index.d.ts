export interface FileInfo {
  path: string
  name: string
  content: string
  lastModified: number
}

export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileTreeNode[]
}

export interface ElectronAPI {
  file: {
    open: () => Promise<FileInfo | null>
    save: (path: string, content: string) => Promise<{ success: boolean }>
    saveAs: (content: string) => Promise<{ path: string; name: string } | null>
    newFile: () => Promise<void>
    openPath: (path: string) => Promise<FileInfo | null>
    create: (dirPath: string, name: string) => Promise<{ path: string; name: string }>
    delete: (filePath: string) => Promise<boolean>
  }
  dir: {
    list: (path: string) => Promise<FileTreeNode[]>
    create: (parentPath: string, name: string) => Promise<{ path: string; name: string }>
  }
  export: {
    pdf: (html: string) => Promise<{ success: boolean; path: string } | null>
    html: (html: string) => Promise<{ success: boolean; path: string } | null>
  }
  dialog: {
    openFile: () => Promise<string | null>
    openFolder: () => Promise<string | null>
    saveFile: () => Promise<string | null>
    confirm: (message: string, detail?: string) => Promise<boolean>
  }
  app: {
    getPath: (name: 'documents' | 'desktop' | 'home') => Promise<string>
  }
  on: {
    menuAction: (callback: (action: string) => void) => () => void
    fileChanged: (callback: (path: string) => void) => () => void
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
