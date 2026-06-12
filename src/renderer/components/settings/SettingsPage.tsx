import { useState } from 'react'
import { useSettingsStore, type Theme } from '../../stores/settings.store'
import { useUIStore } from '../../stores/ui.store'
import { Minus, Plus, ArrowLeft, Settings2, Keyboard, BookOpen } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import { editorExtensions } from '../../lib/tipTap-extensions'

type NavItem = 'general' | 'shortcuts' | 'usage'

export function SettingsPage() {
  const [activeNav, setActiveNav] = useState<NavItem>('general')
  const toggleSettings = useUIStore((s) => s.toggleSettings)

  const navItems: Array<{ key: NavItem; label: string; icon: typeof Settings2 }> = [
    { key: 'general', label: '基础配置', icon: Settings2 },
    { key: 'shortcuts', label: '快捷键', icon: Keyboard },
    { key: 'usage', label: '使用说明', icon: BookOpen },
  ]

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-3 pl-20 pr-4 py-2 border-b border-[var(--border-color)]">
        <button
          onClick={toggleSettings}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-2 py-1 rounded"
        >
          <ArrowLeft size={15} />
          返回
        </button>
        <div className="flex-1 text-center text-sm text-[var(--text-secondary)] pr-12">设置</div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <div className="w-44 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] py-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={cn(
                'flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors text-left',
                activeNav === item.key
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-8 py-8">
            {activeNav === 'general' && <GeneralSettings />}
            {activeNav === 'shortcuts' && <ShortcutsSettings />}
            {activeNav === 'usage' && <UsageGuide />}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const setFontSize = useSettingsStore((s) => s.setFontSize)

  const themes: Array<{ key: Theme; label: string }> = [
    { key: 'github', label: 'GitHub' },
    { key: 'gothic', label: 'Gothic' },
    { key: 'newsprint', label: 'Newsprint' },
    { key: 'night', label: 'Night' },
    { key: 'pixyll', label: 'Pixyll' },
    { key: 'whitey', label: 'Whitey' },
  ]

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">基础配置</h2>

      <div className="mb-6">
        <label className="block text-sm text-[var(--text-secondary)] mb-3">主题</label>
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm transition-colors',
                  theme === t.key
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-3">
          字体大小
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSize(Math.max(12, editorFontSize - 1))}
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm text-[var(--text-primary)] w-10 text-center font-medium tabular-nums">
            {editorFontSize}px
          </span>
          <button
            onClick={() => setFontSize(Math.min(24, editorFontSize + 1))}
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function ShortcutsSettings() {
  const shortcuts = [
    { key: 'Cmd+N', desc: '新建文件' },
    { key: 'Cmd+O', desc: '打开文件' },
    { key: 'Cmd+S', desc: '保存' },
    { key: 'Cmd+Shift+S', desc: '另存为' },
    { key: 'Cmd+B', desc: '切换侧边栏' },
    { key: 'Cmd+/', desc: '切换源码模式' },
    { key: 'Cmd+Shift+F', desc: '专注模式' },
    { key: 'Cmd+Shift+T', desc: '打字机模式' },
    { key: 'Cmd+F', desc: '查找' },
    { key: 'Cmd+Z', desc: '撤销' },
    { key: 'Cmd+Shift+Z', desc: '重做' },
  ]

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">快捷键说明</h2>
      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)]">
              <th className="text-left px-4 py-2.5 text-[var(--text-secondary)] font-medium">快捷键</th>
              <th className="text-left px-4 py-2.5 text-[var(--text-secondary)] font-medium">功能</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((s, i) => (
              <tr
                key={i}
                className={cn(
                  'border-t border-[var(--border-color)]',
                  i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-secondary)]',
                )}
              >
                <td className="px-4 py-2.5 font-mono text-xs text-[var(--accent)]">{s.key}</td>
                <td className="px-4 py-2.5 text-[var(--text-primary)]">{s.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const USAGE_MARKDOWN = `# Markdown 语法示例

## 标题

# 一级标题
## 二级标题
### 三级标题
#### 四级标题

---

**粗体文字**、*斜体文字*、~~删除线~~、\`行内代码\`、[链接](https://example.com)

> 这是一段引用文字，可以包含多个段落。

- 无序列表项一
- 无序列表项二
  - 嵌套列表

1. 有序列表项一
2. 有序列表项二

---

| 表格 | 示例 |
| --- | --- |
| 单元格 | 内容 |
| Markdown | 编辑器 |

---

- [x] 已完成任务
- [ ] 待办任务

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!")
}
\`\`\`

行内公式：$E = mc^2$

块级公式：
$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
\`\`\`
`

function UsageGuide() {
  const editor = useEditor({
    extensions: editorExtensions,
    content: USAGE_MARKDOWN,
    contentType: 'markdown',
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        spellcheck: 'false',
      },
    },
  })

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">使用说明（可编辑预览，不保存）</h2>
      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-primary)]">
        {editor && <EditorContent editor={editor} />}
      </div>
    </section>
  )
}
