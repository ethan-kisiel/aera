import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Entry, EntrySearchFilter, SortConfig } from '../types/shared-types'

// Custom APIs for renderer
const ledgerApi = {
  getColumnUniques: (column: string): Promise<string[] | undefined> =>
    ipcRenderer.invoke('ledger:get-column-uniques', column),

  getUniqueYears: (): Promise<string[]> => ipcRenderer.invoke('ledger:get-unique-years'),

  getEntriesTotal: (searchFilter: EntrySearchFilter): Promise<number> =>
    ipcRenderer.invoke('ledger:get-entries-total', searchFilter),

  createEntry: (entry: Entry): Promise<Entry | undefined> =>
    ipcRenderer.invoke('ledger:create-entry', entry),

  getById: (id: number): Promise<Entry | undefined> => ipcRenderer.invoke('ledger:get-by-id', id),

  getAll: (sortConfig?: SortConfig): Promise<Entry[]> =>
    ipcRenderer.invoke('ledger:get-all', sortConfig),

  updateEntry: (entry: Entry): Promise<Entry | undefined> =>
    ipcRenderer.invoke('ledger:update-entry', entry),

  search: (searchFilter: EntrySearchFilter, sortConfig?: SortConfig): Promise<Entry[]> =>
    ipcRenderer.invoke('ledger:search', searchFilter, sortConfig),

  deleteEntry: (id: number): Promise<number | undefined> =>
    ipcRenderer.invoke('ledger:delete-entry', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('ledgerApi', ledgerApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
