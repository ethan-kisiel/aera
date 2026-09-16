export interface Entry {
  id: number
  amount: number
  date: string
  check_number: string
  checkbook: string
  category: string
  subcategory: string
  itemization: string
  notes: string
}

export interface SortConfig {
  column: string
  descending: boolean
}

export interface EntrySearchFilter {
  year: string
  amount_range: [start: number, end: number]
  check_numbers: string[]
  checkbooks: string[]
  categories: string[]
  subcategories: string[]
  itemizations: string[]
}
