export interface ILedgerAPI {
  createEntry(entry: Entry): Promise;
  getById(id: number): Promise;
  getAll(sortConfig?: SortConfig): Promise;
  updateEntry(entry: Entry): Promise;
  search(searchFilter: EntrySearchFilter, sortConfig?: SortConfig | undefied): Promise;
}

declare global {
  interface Window {
    ledgerApi: ILedgerAPI;
  }
}