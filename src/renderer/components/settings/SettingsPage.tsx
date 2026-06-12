import { useState } from 'react'
import { useSettingsStore, type Theme } from '../../stores/settings.store'
import { useUIStore } from '../../stores/ui.store'
import { Sun, Moon, Coffee, Minus, Plus, ArrowLeft, Settings2, Keyboard, BookOpen } from 'lucide-react'
import { cn } from '../../lib/utils'

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

  const themes: Array<{ key: Theme; label: string; icon: typeof Sun }> = [
    { key: 'light', label: '浅色', icon: Sun },
    { key: 'dark', label: '深色', icon: Moon },
    { key: 'sepia', label: '暖色', icon: Coffee },
  ]

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">基础配置</h2>

      <div className="mb-6">
        <label className="block text-sm text-[var(--text-secondary)] mb-3">主题</label>
        <div className="flex gap-2">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm transition-colors',
                theme === t.key
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]',
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
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

function UsageGuide() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">软件使用说明</h2>
      <div className="space-y-6 text-sm text-[var(--text-primary)] leading-relaxed">
        <div>
          <h3 className="font-medium mb-2">标题</h3>
          <p className="text-[var(--text-secondary)]">
            输入 <code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs"># 标题</code> 然后按 <kbd className="bg-[var(--bg-tertiary)] px-1 rounded text-xs border border-[var(--border-color)]">Enter</kbd> 回车键，该行即渲染为一级标题，同时光标移至下一行新段落。支持一至六级标题。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">文字样式</h3>
          <p className="text-[var(--text-secondary)]">
            <code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">**粗体**</code> 加粗，<code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">*斜体*</code> 斜体，<code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">~~删除线~~</code> 删除，<code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">`代码`</code> 行内代码。输入后自动转换。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">列表</h3>
          <p className="text-[var(--text-secondary)]">
            <code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">- </code> 加空格创建无序列表，<code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">1. </code> 创建有序列表。回车续写，连按两次回车退出。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">代码块与引用</h3>
          <p className="text-[var(--text-secondary)]">
            <code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">```</code> 回车创建代码块，支持语法高亮。<code className="bg-[var(--bg-tertiary)] px-1 rounded text-xs">&gt; </code> 创建引用块。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">链接与图片</h3>
          <p className="text-[var(--text-secondary)]">
            粘贴 URL 自动转为链接。拖拽图片或 <kbd className="bg-[var(--bg-tertiary)] px-1 rounded text-xs border border-[var(--border-color)]">Cmd+V</kbd> 粘贴剪贴板图片。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">文件管理</h3>
          <p className="text-[var(--text-secondary)]">
            点击顶部「文件」按钮打开侧边栏选择文件夹。右键文件树可新建/删除。新文件默认「未命名」，<kbd className="bg-[var(--bg-tertiary)] px-1 rounded text-xs border border-[var(--border-color)]">Cmd+S</kbd> 保存时命名。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">导出</h3>
          <p className="text-[var(--text-secondary)]">
            菜单「文件」→「导出为 PDF / HTML」导出文档。
          </p>
        </div>
      </div>
    </section>
  )
}
