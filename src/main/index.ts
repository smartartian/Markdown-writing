import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { createAppMenu } from './menu'
import { registerFileHandlers } from './ipc/file.handlers'
import { registerDialogHandlers } from './ipc/dialog.handlers'
import { registerAppHandlers } from './ipc/app.handlers'
import { registerExportHandlers } from './ipc/export.handlers'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    title: 'Markdown writing',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const menu = createAppMenu(mainWindow)
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerAllHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function registerAllHandlers(): void {
  registerFileHandlers(ipcMain)
  registerDialogHandlers(ipcMain)
  registerAppHandlers(ipcMain)
  registerExportHandlers(ipcMain)
}
