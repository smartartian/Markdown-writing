import { BrowserWindow, dialog, ipcMain, app } from 'electron'
import { rename as fsRename } from 'fs/promises'
import { IPC } from '../../shared/ipc-channels'
import * as fileService from '../services/file.service'

export function registerFileHandlers(ipc: typeof ipcMain): void {
  ipc.handle(IPC.FILE_OPEN, async () => {
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

    const filePath = result.filePaths[0]
    const data = await fileService.readFile(filePath)
    return data
  })

  ipc.handle(IPC.FILE_SAVE, async (_event, filePath: string, content: string) => {
    await fileService.writeFile(filePath, content)
    return { success: true }
  })

  ipc.handle(IPC.FILE_SAVE_AS, async (_event, content: string) => {
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

    await fileService.writeFile(result.filePath, content)
    return { path: result.filePath, name: fileService.getFileName(result.filePath) }
  })

  ipc.handle(IPC.FILE_OPEN_PATH, async (_event, filePath: string) => {
    const data = await fileService.readFile(filePath)
    return data
  })

  ipc.handle(IPC.DIR_LIST, async (_event, dirPath: string) => {
    return fileService.listDirectory(dirPath)
  })

  ipc.handle(IPC.FILE_CREATE, async (_event, dirPath: string, name: string) => {
    const filePath = `${dirPath}/${name}.md`
    await fileService.writeFile(filePath, '')
    return { path: filePath, name: `${name}.md` }
  })

  ipc.handle(IPC.DIR_CREATE, async (_event, parentPath: string, name: string) => {
    const dirPath = `${parentPath}/${name}`
    await fileService.createDirectory(dirPath)
    return { path: dirPath, name }
  })

  ipc.handle(IPC.FILE_RENAME, async (_event, oldPath: string, newName: string) => {
    const dir = oldPath.replace(/\/[^/]+$/, '')
    const newPath = `${dir}/${newName}`
    await fsRename(oldPath, newPath)
    return { path: newPath, name: newName }
  })

  ipc.handle(IPC.FILE_BATCH_DELETE, async (_event, filePaths: string[]) => {
    const deleted: string[] = []
    const failed: string[] = []
    for (const fp of filePaths) {
      try {
        await fileService.deleteFile(fp)
        deleted.push(fp)
      } catch {
        failed.push(fp)
      }
    }
    return { deleted, failed }
  })

  ipc.handle(IPC.FILE_DELETE, async (_event, filePath: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return false
    const result = await dialog.showMessageBox(win, {
      type: 'warning',
      title: '确认删除',
      message: `确定要删除此文件吗？`,
      detail: filePath,
      buttons: ['取消', '删除'],
      defaultId: 0,
      cancelId: 0,
    })
    if (result.response === 1) {
      await fileService.deleteFile(filePath)
      return true
    }
    return false
  })

  ipc.handle(IPC.SAVE_IMAGE, async (_event, base64Data: string, docDir: string | null) => {
    let targetDir: string
    if (docDir) {
      targetDir = `${docDir}/assets`
    } else {
      const appData = app.getPath('documents')
      targetDir = `${appData}/Markdown writing/images`
    }
    const filename = await fileService.saveBase64Image(base64Data, targetDir)
    return { filename, dir: targetDir }
  })

  ipc.handle(IPC.COPY_IMAGE, async (_event, originPath: string, docDir: string | null) => {
    let targetDir: string
    if (docDir) {
      targetDir = `${docDir}/assets`
    } else {
      const appData = app.getPath('documents')
      targetDir = `${appData}/Markdown writing/images`
    }
    const filename = await fileService.copyImageFile(originPath, targetDir)
    return { filename, dir: targetDir }
  })
}
