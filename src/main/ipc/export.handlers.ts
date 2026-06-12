import { BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'
import * as exportService from '../services/export.service'

export function registerExportHandlers(ipc: typeof ipcMain): void {
  ipc.handle(IPC.EXPORT_PDF, async (_event, html: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showSaveDialog(win, {
      title: 'Export to PDF',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })

    if (result.canceled || !result.filePath) return null
    await exportService.exportToPdf(html, result.filePath)
    return { success: true, path: result.filePath }
  })

  ipc.handle(IPC.EXPORT_HTML, async (_event, html: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showSaveDialog(win, {
      title: 'Export to HTML',
      filters: [{ name: 'HTML', extensions: ['html'] }],
    })

    if (result.canceled || !result.filePath) return null
    await exportService.exportToHtml(html, result.filePath)
    return { success: true, path: result.filePath }
  })
}
