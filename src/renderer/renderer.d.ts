export interface ILedgerAPI {
  createEntry(entry: Entry): Promise<Entry?>;
  getById(id: number): Promise<Entry?>;
  getAll(sortConfig?: SortConfig): Promise<Entry[]>;
  updateEntry(entry: Entry): Promise<Entry?>;
  search(searchFilter: EntrySearchFilter, sortConfig?: SortConfig | undefied): Promise<Entry[]>;
}

declare global {
  interface Window {
    ledgerApi: ILedgerAPI;
  }
}