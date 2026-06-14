import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'

const api = {
  file: {
    open: () => ipcRenderer.invoke(IPC.FILE_OPEN),
    save: (path: string, content: string) => ipcRenderer.invoke(IPC.FILE_SAVE, path, content),
    saveAs: (content: string) => ipcRenderer.invoke(IPC.FILE_SAVE_AS, content),
    newFile: () => ipcRenderer.invoke(IPC.FILE_NEW),
    openPath: (path: string) => ipcRenderer.invoke(IPC.FILE_OPEN_PATH, path),
    create: (dirPath: string, name: string) => ipcRenderer.invoke(IPC.FILE_CREATE, dirPath, name),
    delete: (filePath: string) => ipcRenderer.invoke(IPC.FILE_DELETE, filePath),
    batchDelete: (filePaths: string[]) => ipcRenderer.invoke(IPC.FILE_BATCH_DELETE, filePaths),
    rename: (oldPath: string, newName: string) => ipcRenderer.invoke(IPC.FILE_RENAME, oldPath, newName),
    saveImage: (base64Data: string, docDir: string | null) => ipcRenderer.invoke(IPC.SAVE_IMAGE, base64Data, docDir),
    copyImage: (originPath: string, docDir: string | null) => ipcRenderer.invoke(IPC.COPY_IMAGE, originPath, docDir),
  },
  dir: {
    list: (path: string) => ipcRenderer.invoke(IPC.DIR_LIST, path),
    create: (parentPath: string, name: string) => ipcRenderer.invoke(IPC.DIR_CREATE, parentPath, name),
  },
  export: {
    pdf: (html: string) => ipcRenderer.invoke(IPC.EXPORT_PDF, html),
    html: (html: string) => ipcRenderer.invoke(IPC.EXPORT_HTML, html),
  },
  dialog: {
    openFile: () => ipcRenderer.invoke(IPC.DIALOG_OPEN_FILE),
    openFolder: () => ipcRenderer.invoke(IPC.DIALOG_OPEN_FOLDER),
    saveFile: () => ipcRenderer.invoke(IPC.DIALOG_SAVE_FILE),
    confirm: (message: string, detail?: string) => ipcRenderer.invoke(IPC.DIALOG_CONFIRM, message, detail),
  },
  app: {
    getPath: (name: 'documents' | 'desktop' | 'home') => ipcRenderer.invoke(IPC.APP_GET_PATH, name),
    newWindow: (filePath?: string) => ipcRenderer.invoke('window:new', filePath),
  },
  on: {
    menuAction: (callback: (action: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action)
      ipcRenderer.on(IPC.EVENT_MENU_ACTION, handler)
      return () => ipcRenderer.removeListener(IPC.EVENT_MENU_ACTION, handler)
    },
    fileChanged: (callback: (path: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, path: string) => callback(path)
      ipcRenderer.on(IPC.EVENT_FILE_CHANGED, handler)
      return () => ipcRenderer.removeListener(IPC.EVENT_FILE_CHANGED, handler)
    },
    openFile: (callback: (path: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, path: string) => callback(path)
      ipcRenderer.on('event:open-file', handler)
      return () => ipcRenderer.removeListener('event:open-file', handler)
    },
  },
}

contextBridge.exposeInMainWorld('api', api)
