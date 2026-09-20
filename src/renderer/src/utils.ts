import { Entry, EntrySearchFilter, SortConfig } from '../../types/shared-types'
import { ILedgerAPI } from '../renderer'

export async function flexibleSerach(
  ledgerApi: ILedgerAPI,
  year: string,
  searchText: string
): Promise<Entry[]> {
  const baseFilter: Partial<EntrySearchFilter> = {
    year: year
  }
  console.log(`SEARCH TEXT: ${searchText}`)
  const sortConfig: SortConfig = {
    column: 'date',
    descending: false
  }

  const checkbookMatches = await ledgerApi.search(
    {
      ...baseFilter,
      checkbooks: [searchText]
    },
    sortConfig
  )

  const checkNumberMatches = await ledgerApi.search(
    {
      ...baseFilter,
      check_numbers: [searchText]
    },
    sortConfig
  )
  const categoryMatches = await ledgerApi.search(
    {
      ...baseFilter,
      categories: [searchText]
    },
    sortConfig
  )
  const subcategoryMatches = await ledgerApi.search(
    {
      ...baseFilter,
      subcategories: [searchText]
    },
    sortConfig
  )
  const itemizationMatches = await ledgerApi.search(
    {
      ...baseFilter,
      itemizations: [searchText]
    },
    sortConfig
  )
  const combined = new Set([
    ...checkbookMatches.map(e => JSON.stringify(e)),
    ...checkNumberMatches.map(e => JSON.stringify(e)),
    ...categoryMatches.map(e => JSON.stringify(e)),
    ...subcategoryMatches.map(e => JSON.stringify(e)),
    ...itemizationMatches.map(e => JSON.stringify(e))
  ])

  return [...combined].map(e => JSON.parse(e)).sort((a: Entry, b: Entry) => a.date.localeCompare(b.date))
}
