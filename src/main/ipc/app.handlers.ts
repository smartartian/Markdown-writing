import { app, ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'

export function registerAppHandlers(ipc: typeof ipcMain): void {
  ipc.handle(IPC.APP_GET_PATH, async (_event, name: 'documents' | 'desktop' | 'home') => {
    return app.getPath(name)
  })
}
