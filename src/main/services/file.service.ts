import { readFile as fsReadFile, writeFile as fsWriteFile, readdir, stat, mkdir, unlink } from 'fs/promises'
import { app } from 'electron'
import { basename, join } from 'path'

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

export async function readFile(filePath: string): Promise<FileInfo> {
  const content = await fsReadFile(filePath, 'utf-8')
  const stats = await stat(filePath)
  return {
    path: filePath,
    name: basename(filePath),
    content,
    lastModified: stats.mtimeMs,
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fsWriteFile(filePath, content, 'utf-8')
}

export function getFileName(filePath: string): string {
  return basename(filePath)
}

export async function listDirectory(dirPath: string): Promise<FileTreeNode[]> {
  const entries = await readdir(dirPath)
  const nodes: FileTreeNode[] = []

  for (const entry of entries) {
    if (entry.startsWith('.')) continue
    const fullPath = join(dirPath, entry)
    try {
      const stats = await stat(fullPath)
      const node: FileTreeNode = {
        name: entry,
        path: fullPath,
        isDirectory: stats.isDirectory(),
      }

      if (stats.isDirectory()) {
        node.children = await listDirectory(fullPath)
      }

      if (stats.isDirectory() || entry.endsWith('.md') || entry.endsWith('.markdown') || entry.endsWith('.txt')) {
        nodes.push(node)
      }
    } catch {
      // Skip entries that can't be accessed
    }
  }

  nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return nodes
}

export async function createDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true })
}

export async function deleteFile(filePath: string): Promise<void> {
  await unlink(filePath)
}

export async function saveBase64Image(base64Data: string, targetDir: string): Promise<string> {
  // Remove data URL prefix if present
  const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
  let ext = 'png'
  let data = base64Data
  if (match) {
    ext = match[1] === 'jpeg' ? 'jpg' : match[1]
    data = match[2]
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
  const filename = `image-${timestamp}.${ext}`

  await mkdir(targetDir, { recursive: true })
  const filePath = `${targetDir}/${filename}`
  await fsWriteFile(filePath, Buffer.from(data, 'base64'))
  return filename
}
