import { useState, useMemo } from 'react'
import { useSettingsStore, type Theme } from '../../stores/settings.store'
import { useUIStore } from '../../stores/ui.store'
import { Minus, Plus, ArrowLeft, Settings2, Keyboard, BookOpen, Eye, Code2 } from 'lucide-react'
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
        <div className="w-1/5 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] py-4">
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
        <div className="w-4/5 overflow-y-auto">
          <div className="px-8 py-8">
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

const USAGE_MARKDOWN = `# Markdown 语法手册

**标准 Markdown + 扩展语法**参考手册，下面按分类整理。

## 一、基础文本样式

### 1. 标题（6级）

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

写法：\`#\` 号开头，数量对应 1~6 级

### 2. 加粗

**加粗文字**
__加粗文字__

写法：\`**文字**\` 或 \`__文字__\`

### 3. 斜体

*斜体文字*
_斜体文字_

写法：\`*文字*\` 或 \`_文字_\`

### 4. 加粗+斜体

***粗斜体***

### 5. 删除线

~~删除线内容~~

### 6. 下划线（HTML标签）

<u>下划线文本</u>

### 7. 高亮

==高亮文字==

### 8. 行内代码

\`行内代码\`

---

## 二、列表

### 1. 无序列表

- 列表项1
- 列表项2
  - 子列表（缩进2空格）
* 也可用星号
+ 也可用加号

### 2. 有序列表

1. 第一项
2. 第二项
   1. 子有序列表
3. 第三项

### 3. 任务列表（待办）

- [ ] 未完成任务
- [x] 已完成任务

---

## 三、引用

### 1. 单行引用

> 引用内容

### 2. 多行/嵌套引用

> 一级引用
>> 嵌套二级引用

---

## 四、分割线

三种写法效果一致：

---
***
___

---

## 五、链接 & 图片

### 1. 行内链接

[显示文字](链接地址 "可选标题")
[百度](https://www.baidu.com)

### 2. 引用式链接

[文字][标记]
[标记]: https://xxx.com

### 3. 自动链接

<https://www.baidu.com>

### 4. 图片

![图片alt文字](https://example.com/photo.jpg)

---

## 六、代码块

### 1. 基础代码块

\`\`\`
普通代码块
多行内容
\`\`\`

### 2. 指定语言（语法高亮）

\`\`\`python
print("Hello")
\`\`\`

\`\`\`java
public static void main(){}
\`\`\`

\`\`\`javascript
let a = 1;
\`\`\`

支持：python / java / js / go / sql / html / css / c++ / shell 等

### 3. 行内代码

\`code\`

---

## 七、表格

### 基础表格

| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |

### 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
| :----- | :------: | -----: |
| 内容   | 内容     | 内容   |

\`:---\` 左对齐、\`:---:\` 居中、\`---:\` 右对齐

---

## 八、HTML 标签

1. 字体颜色：<font color="red">红色文字</font>
2. 居中：<center>居中文字</center>
3. 强制换行：<br>

---

## 九、公式（LaTeX 数学公式）

### 1. 行内公式

$E = mc^2$

### 2. 块级公式

$$
\\sum_{i=1}^n i = \\frac{n(n+1)}{2}
$$

---

## 十、脚注

正文内容[^注脚标记]

[^注脚标记]: 这里是脚注解释内容

---

## 十一、目录

\`[toc]\` 放在文档顶部，自动根据标题生成全文目录。

---

## 十二、表情符号

:smile: :laugh: :cry: :+1:

常用：\`:+1:\` 点赞、\`:warning:\` 警告、\`:memo:\` 笔记

---

## 十三、高级扩展语法

### 1. 注释（仅源码可见）

<!-- 这是注释，预览看不到 -->

### 2. 上下标

下标：H~2~O → H₂O

上标：x^2^ → x²

### 3. 详情折叠块

<details>
<summary>点击展开</summary>

隐藏的内容

</details>

---

语法兼容标准 GitHub Markdown / CommonMark，复制到其他 MD 编辑器基本可用。
`

function UsageGuide() {
  const [sourceView, setSourceView] = useState(false)

  // Pre-process: convert math syntax to HTML tags so they survive the
  // markdown parser, while standard markdown is handled by marked.js.
  const preprocessedMd = useMemo(() => {
    let md = USAGE_MARKDOWN
    // Block math: $$...$$ → <div data-type="math-block">...</div>
    md = md.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (_, latex) =>
      `<div data-type="math-block">${latex.trim()}</div>`)
    // Inline math: $...$ → <math-inline data-latex="..."/>
    md = md.replace(/\$([^$\n]+)\$/g, (_, latex) =>
      `<math-inline data-latex="${latex.replace(/"/g, '&quot;')}"/>`)
    return md
  }, [])

  const editor = useEditor({
    extensions: editorExtensions,
    content: preprocessedMd,
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">使用说明</h2>
        <button
          onClick={() => setSourceView(!sourceView)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-2 py-1 rounded border border-[var(--border-color)]"
        >
          {sourceView ? <><Eye size={14} />预览</> : <><Code2 size={14} />源码</>}
        </button>
      </div>
      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-primary)]">
        {sourceView ? (
          <pre className="tiptap-editor whitespace-pre-wrap font-mono text-sm">{USAGE_MARKDOWN}</pre>
        ) : (
          editor ? <EditorContent editor={editor} /> : <div className="p-8 text-[var(--text-muted)]">编辑器加载中...</div>
        )}
      </div>
    </section>
  )
}
