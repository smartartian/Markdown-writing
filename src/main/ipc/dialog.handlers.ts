import { BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'

export function registerDialogHandlers(ipc: typeof ipcMain): void {
  ipc.handle(IPC.DIALOG_OPEN_FILE, async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      title: 'Open Markdown File',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipc.handle(IPC.DIALOG_OPEN_FOLDER, async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      title: '选择文件夹',
      properties: ['openDirectory'],
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipc.handle(IPC.DIALOG_SAVE_FILE, async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showSaveDialog(win, {
      title: 'Save Markdown File',
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePath) return null
    return result.filePath
  })

  ipc.handle(IPC.DIALOG_CONFIRM, async (_event, message: string, detail?: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return false

    const result = await dialog.showMessageBox(win, {
      type: 'question',
      title: 'Confirm',
      message,
      detail,
      buttons: ['Cancel', 'OK'],
      defaultId: 1,
      cancelId: 0,
    })

    return result.response === 1
  })
}
