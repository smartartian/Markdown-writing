import { BrowserWindow } from 'electron'
import { writeFile } from 'fs/promises'

export async function exportToPdf(html: string, outputPath: string): Promise<void> {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      offscreen: true,
      sandbox: true,
    },
  })

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    preferCSSPageSize: true,
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.5,
      right: 0.5,
    },
  })

  await writeFile(outputPath, pdfData)
  win.destroy()
}

export async function exportToHtml(html: string, outputPath: string): Promise<void> {
  await writeFile(outputPath, html, 'utf-8')
}
