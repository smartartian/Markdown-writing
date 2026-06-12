import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

interface RecentFile {
  path: string
  name: string
  lastOpened: number
}

const MAX_RECENT = 20

function getRecentFilePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'recent-files.json')
}

export async function getRecentFiles(): Promise<RecentFile[]> {
  try {
    const data = await readFile(getRecentFilePath(), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function addRecentFile(file: { path: string; name: string }): Promise<RecentFile[]> {
  const recents = await getRecentFiles()
  const filtered = recents.filter((r) => r.path !== file.path)
  filtered.unshift({ ...file, lastOpened: Date.now() })

  if (filtered.length > MAX_RECENT) {
    filtered.length = MAX_RECENT
  }

  const userDataPath = app.getPath('userData')
  await mkdir(userDataPath, { recursive: true })
  await writeFile(getRecentFilePath(), JSON.stringify(filtered, null, 2), 'utf-8')

  return filtered
}
