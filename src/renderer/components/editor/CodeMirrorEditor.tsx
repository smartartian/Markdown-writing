import { useEffect, useRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { searchKeymap } from '@codemirror/search'
import { useSettingsStore } from '../../stores/settings.store'
import { useFileStore } from '../../stores/file.store'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  onScroll?: (scrollTop: number, scrollHeight: number) => void
}

export function CodeMirrorEditor({ value, onChange, onScroll }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const theme = useSettingsStore((s) => s.theme)
  const isDark = theme === 'gothic' || theme === 'night'

  const handleChange = useCallback(
    (doc: string) => {
      onChange(doc)
    },
    [onChange],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleChange(update.state.doc.toString())
      }
    })

    const scrollHandler = EditorView.domEventHandlers({
      scroll: (event) => {
        const target = event.target as HTMLElement
        onScroll?.(target.scrollTop, target.scrollHeight)
      },
    })

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      updateListener,
      scrollHandler,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        'data-enable-grammarly': 'false',
      }),
    ]

    if (isDark) {
      extensions.push(oneDark)
    }

    // Image paste handler for source mode — inserts ![image](path) markdown
    const imagePasteHandler = EditorView.domEventHandlers({
      paste: (event, view) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue

            const reader = new FileReader()
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string
              const docPath = useFileStore.getState().currentFile.path
              const docDir = docPath ? docPath.replace(/\/[^/]+$/, '') : null
              window.api.file.saveImage(dataUrl, docDir).then((result) => {
                const src = docDir ? `assets/${result.filename}` : result.filename
                view.dispatch(view.state.replaceSelection(`![image](${src})`))
              }).catch(() => {
                view.dispatch(view.state.replaceSelection(`![image](${dataUrl})`))
              })
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
    })
    extensions.push(imagePasteHandler)

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Only re-create on theme change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark])

  // Update content when value changes externally (e.g., file open)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (value !== currentContent) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="cm-editor-container"
      style={{
        height: '100%',
        overflow: 'auto',
        fontSize: '15px',
        lineHeight: '1.7',
      }}
    />
  )
}
