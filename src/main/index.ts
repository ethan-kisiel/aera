import { app, shell, screen, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Entry, EntrySearchFilter, SortConfig } from '../types/shared-types'
import { autoUpdater } from 'electron-updater'

type LedgerAddon = typeof import('*/ledger_addon.node')

// eslint-disable-next-line
const ledgerAddon: LedgerAddon = require('bindings')('ledger_addon')

export function registerLedgerIpcHandlers(): void {
  ipcMain.handle(
    'ledger:get-column-uniques',
    async (_event: IpcMainInvokeEvent, column: string): Promise<string[] | undefined> => {
      return ledgerAddon.getColumnUniques(column)
    }
  )

  ipcMain.handle('ledger:get-unique-years', async (): Promise<string[]> => {
    return ledgerAddon.getUniqueYears()
  })

  ipcMain.handle(
    'ledger:get-entries-total',
    async (_event: IpcMainInvokeEvent, searchFilter: EntrySearchFilter): Promise<number> => {
      return ledgerAddon.getEntriesTotal(searchFilter)
    }
  )

  // 1. Create Entry
  ipcMain.handle(
    'ledger:create-entry',
    async (_event: IpcMainInvokeEvent, entry: Entry): Promise<Entry | undefined> => {
      return ledgerAddon.createEntry(entry)
    }
  )

  // 2. Get By ID
  ipcMain.handle(
    'ledger:get-by-id',
    async (_event: IpcMainInvokeEvent, id: number): Promise<Entry | undefined> => {
      return ledgerAddon.getById(id)
    }
  )

  // 3. Get All
  ipcMain.handle(
    'ledger:get-all',
    async (_event: IpcMainInvokeEvent, sortConfig?: SortConfig): Promise<Entry[]> => {
      return ledgerAddon.getAll(sortConfig)
    }
  )

  // 4. Update Entry
  ipcMain.handle(
    'ledger:update-entry',
    async (_event: IpcMainInvokeEvent, entry: Entry): Promise<Entry | undefined> => {
      return ledgerAddon.updateEntry(entry)
    }
  )

  // 5. Search
  ipcMain.handle(
    'ledger:search',
    async (
      _event: IpcMainInvokeEvent,
      searchFilter: EntrySearchFilter,
      sortConfig?: SortConfig
    ): Promise<Entry[]> => {
      return ledgerAddon.search(searchFilter, sortConfig)
    }
  )

  ipcMain.handle(
    'ledger:delete-entry',
    async (_event: IpcMainInvokeEvent, id: number): Promise<number | undefined> => {
      return ledgerAddon.deleteEntry(id)
    }
  )
}

function createWindow(): void {
  // Create the browser window.
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  /*
    NATIVE BINDINGS
  */

  // init db
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'aera.sqlite')
  const result = ledgerAddon.initDb(process.env.NODE_ENV === 'development' ? ':memory:' : dbPath)
  if (result) {
    registerLedgerIpcHandlers()
  }
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  autoUpdater.checkForUpdatesAndNotify()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
