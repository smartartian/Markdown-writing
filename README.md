<p align="center">
  <img src="resources/logo-all.png" alt="Markdown Writing" width="100%">
</p>

# Markdown Writing

一款所见即所得的 Markdown 编辑器，灵感来自 Typora，基于 Electron + TipTap 构建。

## 功能特点

- **所见即所得** — 输入 Markdown 语法实时渲染为富文本样式
- **源码模式** — `Cmd+/` 切换为 Markdown 源码编辑，CodeMirror 6 语法高亮
- **LaTeX 公式** — KaTeX 渲染，支持行内 `$E=mc^2$` 和块级 `$$\sum$$` 公式
- **段落菜单** — macOS 顶部栏完整段落格式菜单，含标题/列表/表格/公式等快捷键
- **专注模式** — `Cmd+Shift+F` 高亮当前段落，其余内容变暗
- **打字机模式** — `Cmd+Shift+T` 光标始终保持在屏幕中央
- **文件管理** — 侧边栏浏览本地文件夹，支持新建/重命名/删除/批量删除
- **拖拽打开** — 拖入文件/文件夹到窗口直接打开，多文件批量新窗口打开
- **大纲视图** — 实时提取标题结构，点击快速跳转
- **主题切换** — 六种主题配色（GitHub / Gothic / Newsprint / Night / Pixyll / Whitey）
- **代码高亮** — highlight.js 语法高亮，支持语言切换下拉框
- **表格编辑** — 浮动工具栏快速增删行列
- **图片处理** — 粘贴/拖拽插入图片，选中显示 Markdown 源码信息
- **内置使用说明** — 完整 Markdown 语法手册，可预览/源码切换
- **导出** — 支持导出 PDF 和 HTML

## 快捷键（macOS）

| 功能 | 快捷键 |
|------|--------|
| 新建文件 | Cmd+N |
| 打开文件 | Cmd+O |
| 保存 | Cmd+S |
| 切换侧边栏 | Cmd+B |
| 切换源码/预览 | Cmd+/ |
| 专注模式 | Cmd+Shift+F |
| 打字机模式 | Cmd+Shift+T |
| 查找 | Cmd+F |
| 一级标题 | Cmd+1 |
| 代码块 | Opt+Cmd+C |
| 公式块 | Opt+Cmd+B |
| 引用 | Opt+Cmd+Q |
| 有序列表 | Opt+Cmd+O |
| 无序列表 | Opt+Cmd+U |
| 水平分割线 | Opt+Cmd+- |

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron + electron-vite |
| 编辑器引擎 | TipTap (ProseMirror) |
| 源码编辑 | CodeMirror 6 |
| 公式渲染 | KaTeX |
| 代码高亮 | highlight.js + lowlight |
| 界面 | React 19 + Tailwind CSS |
| 状态管理 | Zustand |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 生产构建
npm run build
```

## 打包

```bash
# 打包为 macOS 桌面应用
npm run package
```

打包配置见 `electron-builder.yml`，应用图标位于 `resources/` 目录。打包产物输出至 `dist/` 目录。

## 项目结构

```
src/
├── main/          # Electron 主进程（窗口、菜单、IPC）
│   ├── ipc/       # 文件、导出、对话框处理
│   └── services/  # 文件读写、导出管道
├── preload/       # 预加载脚本（contextBridge）
├── renderer/      # React 渲染进程
│   ├── components/
│   │   ├── editor/      # 编辑器核心、源码模式、工具栏
│   │   ├── sidebar/     # 侧边栏、文件树、大纲
│   │   ├── settings/    # 设置页面
│   │   └── layout/      # 状态栏
│   ├── hooks/           # 自动保存、菜单事件
│   ├── stores/          # Zustand 状态管理
│   ├── assets/          # 样式、主题
│   └── lib/             # TipTap扩展、markdown解析器、KaTeX扩展
└── shared/        # IPC通道、默认配置
```

## 许可证

MIT
