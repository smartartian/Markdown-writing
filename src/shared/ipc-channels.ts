export const IPC = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_NEW: 'file:new',
  FILE_OPEN_PATH: 'file:open-path',

  DIR_LIST: 'dir:list',
  FILE_CREATE: 'file:create',
  DIR_CREATE: 'dir:create',
  FILE_DELETE: 'file:delete',
  SAVE_IMAGE: 'image:save',

  EXPORT_PDF: 'export:pdf',
  EXPORT_HTML: 'export:html',

  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_OPEN_FOLDER: 'dialog:open-folder',
  DIALOG_SAVE_FILE: 'dialog:save-file',
  DIALOG_CONFIRM: 'dialog:confirm',

  APP_GET_PATH: 'app:get-path',

  EVENT_FILE_CHANGED: 'event:file-changed',
  EVENT_MENU_ACTION: 'event:menu-action',
  EVENT_WINDOW_FOCUSED: 'event:window-focused',
} as const
