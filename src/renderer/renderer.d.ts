export interface ILedgerAPI {
  getColumnUniques(column: string): Promise<string[] | undefined>
  getUniqueYears(): Promise<string[]>
  getEntriesTotal(searchFilter: EntrySearchFilter): Promise<number>
  createEntry(entry: Entry): Promise<Entry?>
  getById(id: number): Promise<Entry?>
  getAll(sortConfig?: SortConfig): Promise<Entry[]>
  updateEntry(entry: Entry): Promise<Entry?>
  search(searchFilter: EntrySearchFilter, sortConfig?: SortConfig | undefied): Promise<Entry[]>
  deleteEntry(id: number): Promise<number?>
}

declare global {
  interface Window {
    ledgerApi: ILedgerAPI
  }
}
