import { create } from 'zustand'

type SidebarTab = 'files' | 'outline'

interface UIStore {
  sidebarOpen: boolean
  sidebarTab: SidebarTab
  focusMode: boolean
  typewriterMode: boolean
  showToolbar: boolean
  showStatusBar: boolean
  showSettings: boolean

  toggleSidebar: () => void
  setSidebarTab: (tab: SidebarTab) => void
  toggleFocusMode: () => void
  toggleTypewriterMode: () => void
  toggleToolbar: () => void
  toggleSettings: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  sidebarTab: 'outline',
  focusMode: false,
  typewriterMode: false,
  showToolbar: false,
  showStatusBar: true,
  showSettings: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleTypewriterMode: () => set((s) => ({ typewriterMode: !s.typewriterMode })),
  toggleToolbar: () => set((s) => ({ showToolbar: !s.showToolbar })),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
}))
