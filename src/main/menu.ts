import { BrowserWindow, Menu, MenuItemConstructorOptions, app } from 'electron'

export function createAppMenu(win: BrowserWindow): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { label: '关于 Markdown 编辑器', role: 'about' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏' },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出' },
      ],
    },
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('event:menu-action', 'file:new'),
        },
        {
          label: '打开...',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('event:menu-action', 'file:open'),
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('event:menu-action', 'file:save'),
        },
        {
          label: '另存为...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => win.webContents.send('event:menu-action', 'file:save-as'),
        },
        { type: 'separator' },
        {
          label: '导出为 PDF...',
          click: () => win.webContents.send('event:menu-action', 'export:pdf'),
        },
        {
          label: '导出为 HTML...',
          click: () => win.webContents.send('event:menu-action', 'export:html'),
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '切换侧边栏',
          accelerator: 'CmdOrCtrl+B',
          click: () => win.webContents.send('event:menu-action', 'toggle-sidebar'),
        },
        {
          label: '专注模式',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => win.webContents.send('event:menu-action', 'toggle-focus'),
        },
        {
          label: '打字机模式',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => win.webContents.send('event:menu-action', 'toggle-typewriter'),
        },
        { type: 'separator' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { role: 'resetZoom', label: '重置缩放' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 Markdown 编辑器',
          click: () => win.webContents.send('event:menu-action', 'show-about'),
        },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}
