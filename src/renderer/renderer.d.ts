export interface ILedgerAPI {
  getColumnUniques(column: string): Promise<string[] | undefined>;
  getEntriesTotal(searchFilter: EntrySearchFilter): Promise<Number>;
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