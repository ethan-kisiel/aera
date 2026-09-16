import { Entry, EntrySearchFilter, SortConfig } from '../types/shared-types';

declare module '*/ledger_addon.node' {
    export function getColumnUniques(column: string): string[] | undefined;
    export function getUniqueYears(): string[];
    export function getEntriesTotal(searchFilter: EntrySearchFilter): Number;
    export function createEntry(entry: Entry): Entry | undefined;
    export function getById(id: number): Entry | undefined;
    export function getAll(sortConfig?: SortConfig): Entry[];
    export function updateEntry(entry: Entry): Entry | undefined;
    export function search(searchFilter: EntrySearchFilter, sortConfig?: SortConfig): Entry[];
}