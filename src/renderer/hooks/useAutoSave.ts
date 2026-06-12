import { useEffect, useRef, useCallback } from 'react'
import { useFileStore } from '../stores/file.store'
import { useEditorStore } from '../stores/editor.store'

export function useAutoSave(getMarkdown: () => string): void {
  const currentFile = useFileStore((s) => s.currentFile)
  const markClean = useFileStore((s) => s.markClean)
  const updateWordCount = useEditorStore((s) => s.updateWordCount)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirtyRef = useRef(false)

  // Subscribe to dirty flag changes
  useEffect(() => {
    const unsub = useFileStore.subscribe((state) => {
      if (state.isDirty) {
        dirtyRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          if (!currentFile.path) return
          const content = getMarkdown()
          window.api.file.save(currentFile.path, content).then(() => {
            markClean()
            updateWordCount(content)
          }).catch((err) => {
            console.error('自动保存失败:', err)
          })
          dirtyRef.current = false
        }, 1000)
      }
    })
    return unsub
  }, [currentFile.path, getMarkdown, markClean, updateWordCount])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
