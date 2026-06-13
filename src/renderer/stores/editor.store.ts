import { create } from 'zustand'

export interface HeadingItem {
  level: number
  text: string
  pos: number
}

interface EditorStore {
  sourceContent: string
  wordCount: number
  charCount: number
  headings: HeadingItem[]
  viewMode: 'wysiwyg' | 'source'
  sourceToggleCount: number
  paragraphAction: string | null
  paragraphActionCount: number

  setSourceContent: (content: string) => void
  updateWordCount: (markdown: string) => void
  setHeadings: (headings: HeadingItem[]) => void
  setViewMode: (mode: 'wysiwyg' | 'source') => void
  requestSourceToggle: () => void
  requestParagraphAction: (action: string) => void
  clearParagraphAction: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  sourceContent: '',
  wordCount: 0,
  charCount: 0,
  headings: [],
  viewMode: 'wysiwyg',
  sourceToggleCount: 0,
  paragraphAction: null,
  paragraphActionCount: 0,

  setSourceContent: (content) => set({ sourceContent: content }),

  updateWordCount: (markdown) => {
    const text = markdown.replace(/[#*`~>\[\]()!\-|]/g, ' ').replace(/\s+/g, ' ').trim()
    const words = text ? text.split(/\s+/).length : 0
    const chars = markdown.replace(/\s/g, '').length
    set({ wordCount: words, charCount: chars })
  },

  setHeadings: (headings) => set({ headings }),
  setViewMode: (mode) => set({ viewMode: mode }),
  requestSourceToggle: () => set((s) => ({ sourceToggleCount: s.sourceToggleCount + 1 })),
  requestParagraphAction: (action) => set((s) => ({ paragraphAction: action, paragraphActionCount: s.paragraphActionCount + 1 })),
  clearParagraphAction: () => set({ paragraphAction: null }),
}))
