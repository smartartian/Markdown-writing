import { app, BrowserWindow, ipcMain, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { createAppMenu } from './menu'
import { registerFileHandlers } from './ipc/file.handlers'
import { registerDialogHandlers } from './ipc/dialog.handlers'
import { registerAppHandlers } from './ipc/app.handlers'
import { registerExportHandlers } from './ipc/export.handlers'

// Set app name early for macOS dock
app.setName('Markdown writing')

let mainWindow: BrowserWindow | null = null

function createWindow(filePath?: string): void {
  const iconPath = join(__dirname, '../../resources/logo.png')
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    title: 'Markdown writing',
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })

  const menu = createAppMenu(win)
  Menu.setApplicationMenu(menu)

  win.on('closed', () => {
    if (win === mainWindow) mainWindow = null
  })

  // Store the pending file path to send after the page loads
  if (filePath) {
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('event:open-file', filePath)
    })
  }

  if (!mainWindow) mainWindow = win

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set dock icon for macOS
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = join(__dirname, '../../resources/logo.png')
    try {
      app.dock.setIcon(nativeImage.createFromPath(iconPath))
    } catch { /* ignore if icon not found */ }
  }
  registerAllHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// IPC: create a new window with optional file path
ipcMain.handle('window:new', (_event, filePath?: string) => {
  createWindow(filePath)
  return true
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
