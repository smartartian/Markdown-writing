import { BrowserWindow, Menu, MenuItemConstructorOptions, app } from 'electron'

export function createAppMenu(win: BrowserWindow): Menu {
  const send = (action: string) => () => win.webContents.send('event:menu-action', action)

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
          click: send('file:new'),
        },
        {
          label: '新建窗口',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: send('window:new'),
        },
        {
          label: '打开...',
          accelerator: 'CmdOrCtrl+O',
          click: send('file:open'),
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: send('file:save'),
        },
        {
          label: '另存为...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: send('file:save-as'),
        },
        { type: 'separator' },
        {
          label: '导出为 PDF...',
          click: send('export:pdf'),
        },
        {
          label: '导出为 HTML...',
          click: send('export:html'),
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
      label: '段落',
      submenu: [
        {
          label: '一级标题',
          accelerator: 'CmdOrCtrl+1',
          click: send('paragraph:heading-1'),
        },
        {
          label: '二级标题',
          accelerator: 'CmdOrCtrl+2',
          click: send('paragraph:heading-2'),
        },
        {
          label: '三级标题',
          accelerator: 'CmdOrCtrl+3',
          click: send('paragraph:heading-3'),
        },
        {
          label: '四级标题',
          accelerator: 'CmdOrCtrl+4',
          click: send('paragraph:heading-4'),
        },
        {
          label: '五级标题',
          accelerator: 'CmdOrCtrl+5',
          click: send('paragraph:heading-5'),
        },
        {
          label: '六级标题',
          accelerator: 'CmdOrCtrl+6',
          click: send('paragraph:heading-6'),
        },
        { type: 'separator' },
        {
          label: '段落',
          accelerator: 'CmdOrCtrl+0',
          click: send('paragraph:paragraph'),
        },
        { type: 'separator' },
        {
          label: '提升标题级别',
          accelerator: 'CmdOrCtrl+=',
          click: send('paragraph:heading-up'),
        },
        {
          label: '降低标题级别',
          accelerator: 'CmdOrCtrl+-',
          click: send('paragraph:heading-down'),
        },
        { type: 'separator' },
        {
          label: '表格',
          submenu: [
            {
              label: '插入表格',
              click: send('paragraph:table-insert'),
            },
            { type: 'separator' },
            {
              label: '左侧插入列',
              click: send('paragraph:table-add-column-before'),
            },
            {
              label: '右侧插入列',
              click: send('paragraph:table-add-column-after'),
            },
            {
              label: '删除列',
              click: send('paragraph:table-delete-column'),
            },
            { type: 'separator' },
            {
              label: '上方插入行',
              click: send('paragraph:table-add-row-before'),
            },
            {
              label: '下方插入行',
              click: send('paragraph:table-add-row-after'),
            },
            {
              label: '删除行',
              click: send('paragraph:table-delete-row'),
            },
            { type: 'separator' },
            {
              label: '删除表格',
              click: send('paragraph:table-delete'),
            },
          ],
        },
        { type: 'separator' },
        {
          label: '代码块',
          accelerator: 'CmdOrCtrl+Alt+C',
          click: send('paragraph:code-block'),
        },
        {
          label: '公式块',
          accelerator: 'CmdOrCtrl+Alt+B',
          click: send('paragraph:math-block'),
        },
        { type: 'separator' },
        {
          label: '引用',
          accelerator: 'CmdOrCtrl+Alt+Q',
          click: send('paragraph:blockquote'),
        },
        { type: 'separator' },
        {
          label: '有序列表',
          accelerator: 'CmdOrCtrl+Alt+O',
          click: send('paragraph:ordered-list'),
        },
        {
          label: '无序列表',
          accelerator: 'CmdOrCtrl+Alt+U',
          click: send('paragraph:bullet-list'),
        },
        {
          label: '任务列表',
          accelerator: 'CmdOrCtrl+Alt+X',
          click: send('paragraph:task-list'),
        },
        {
          label: '切换任务状态',
          click: send('paragraph:task-toggle'),
        },
        { type: 'separator' },
        {
          label: '增加缩进',
          accelerator: 'CmdOrCtrl+]',
          click: send('paragraph:indent'),
        },
        {
          label: '减少缩进',
          accelerator: 'CmdOrCtrl+[',
          click: send('paragraph:outdent'),
        },
        { type: 'separator' },
        {
          label: '在上方插入段落',
          click: send('paragraph:insert-above'),
        },
        {
          label: '在下方插入段落',
          click: send('paragraph:insert-below'),
        },
        { type: 'separator' },
        {
          label: '链接引用',
          accelerator: 'CmdOrCtrl+Alt+L',
          click: send('paragraph:link-ref'),
        },
        {
          label: '脚注',
          accelerator: 'CmdOrCtrl+Alt+R',
          click: send('paragraph:footnote'),
        },
        { type: 'separator' },
        {
          label: '水平分割线',
          accelerator: 'CmdOrCtrl+Alt+-',
          click: send('paragraph:horizontal-rule'),
        },
        { type: 'separator' },
        {
          label: '内容目录',
          click: send('paragraph:toc'),
        },
        {
          label: 'YAML Front Matter',
          click: send('paragraph:yaml'),
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '切换侧边栏',
          accelerator: 'CmdOrCtrl+B',
          click: send('toggle-sidebar'),
        },
        {
          label: '专注模式',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: send('toggle-focus'),
        },
        {
          label: '打字机模式',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: send('toggle-typewriter'),
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
          click: send('show-about'),
        },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}
