const isMac = process.platform === 'darwin'

// 1. Replicate Electron's exact default menu skeleton using 'roles'
export function getTemplate(
  loadEntriesCallback: () => void
): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] {
  return [
    ...(isMac ? [{ role: 'appMenu' }] : []), // Standard Mac App menu
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    { role: 'helpMenu' },
    // 2. Append your custom top-level menu option safely
    {
      label: 'Legacy',
      submenu: [
        {
          label: 'Load Entries',
          click: loadEntriesCallback
        }
      ]
    }
  ] as (Electron.MenuItemConstructorOptions | Electron.MenuItem)[]
}
