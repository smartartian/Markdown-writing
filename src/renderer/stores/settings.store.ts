import { create } from 'zustand'
import { DEFAULTS } from '../../shared/defaults'

export type Theme = 'light' | 'dark' | 'sepia'

interface SettingsStore {
  theme: Theme
  editorFontFamily: string
  editorFontSize: number
  codeFontFamily: string
  autoSaveEnabled: boolean
  autoSaveInterval: number

  setTheme: (theme: Theme) => void
  setFontFamily: (font: string) => void
  setFontSize: (size: number) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: DEFAULTS.THEME as Theme,
  editorFontFamily: DEFAULTS.EDITOR_FONT_FAMILY,
  editorFontSize: DEFAULTS.EDITOR_FONT_SIZE,
  codeFontFamily: DEFAULTS.CODE_FONT_FAMILY,
  autoSaveEnabled: DEFAULTS.AUTO_SAVE_ENABLED,
  autoSaveInterval: DEFAULTS.AUTO_SAVE_INTERVAL,

  setTheme: (theme) => {
    document.documentElement.classList.remove('light', 'dark', 'sepia')
    document.documentElement.classList.add(theme)
    localStorage.setItem('md-editor-theme', theme)
    set({ theme })
  },
  setFontFamily: (font) => {
    document.documentElement.style.setProperty('--editor-font', font)
    set({ editorFontFamily: font })
  },
  setFontSize: (size) => {
    document.documentElement.style.setProperty('--editor-font-size', `${size}px`)
    set({ editorFontSize: size })
  },
}))
