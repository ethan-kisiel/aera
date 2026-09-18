// ledger-view.ts

import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import '../components/simple-table'
import '../components/year-selector'

import type { TableColumn } from '../components/simple-table'
import { Entry } from '../../../types/shared-types'

@customElement('ledger-view')
export class LedgerView extends LitElement {
  @property({ type: Array })
  public rows: Entry[] = []

  @property({ type: Array })
  public years: string[] = []

  @property({ type: String })
  public selectedYear = ''

  @property({ type: WeakSet<Entry> }) // Note: Lit won't auto-update if this is mutated directly; ensure re-renders are triggered if needed
  public deletedRows = new WeakSet<Entry>()

  @property({ type: Number })
  public totalAmount = 0

  private _formatAmount(value: number): string {
    if (typeof value !== 'number') {
      return ''
    }

    const convertedValue = `${value}`.padStart(3, '0')
    const dollars = convertedValue.slice(0, -2)
    const cents = convertedValue.slice(-2)
    const dollarsMatch = dollars.match(/.{1,3}(?=(.{3})*$)/g)?.join(',') ?? dollars

    const convertedString = dollarsMatch + '.' + cents
    return `$${convertedString}`
  }

  private get _activeRows(): Entry[] {
    // Filter out rows that are marked as deleted in the WeakSet
    return this.rows.filter((row) => !this.deletedRows.has(row))
  }

  private readonly _columns: TableColumn<Entry>[] = [
    {
      key: 'date',
      header: 'Date (MM/DD)',
      getValue: (row) => `${row.date.split('-')[1]}/${row.date.split('-')[2]}`,
      width: '110px'
    },
    {
      key: 'checkbook',
      header: 'Checkbook',
      getValue: (row) => row.checkbook,
      width: '140px'
    },
    {
      key: 'checkNumber',
      header: 'Check #',
      getValue: (row) => row.check_number,
      width: '90px'
    },
    {
      key: 'amount',
      header: 'Amount',
      getValue: (row) => row.amount,
      width: '120px',
      formatValue: (value) => this._formatAmount(value as number)
    },
    {
      key: 'category',
      header: 'Category',
      getValue: (row) => row.category,
      width: '140px'
    },
    {
      key: 'subCategory',
      header: 'Subcategory',
      getValue: (row) => row.subcategory,
      width: '150px'
    },
    {
      key: 'itemization',
      header: 'Itemization',
      getValue: (row) => row.itemization,
      width: '160px'
    },
    {
      key: 'notes',
      header: 'Notes',
      getValue: (row) => row.notes
    }
  ]

  protected override render(): TemplateResult {
    return html`
      <div class="ledger-view">
        <header class="ledger-header">
          <h2 class="ledger-title">Ledger</h2>
          <div class="ledger-stats">
            <span>Entries: <strong>${this._activeRows.length}</strong></span>
            <span>Total: <strong>${this._formatAmount(this.totalAmount)}</strong></span>
          </div>
        </header>

        <section class="table-container">
          <simple-table
            .rows=${this.rows}
            .columns=${this._columns}
            .deletedRows=${this.deletedRows}
            emptyText="No entries for this year."
            @row-focus=${this._handleRowFocus}
            @row-delete=${this._handleRowDelete}
          ></simple-table>
        </section>

        <footer class="year-selector-container">
          <year-selector
            .years=${this.years}
            .selectedYear=${this.selectedYear}
            @year-change=${this._handleYearChange}
            @year-add=${this._handleYearAdd}
          ></year-selector>
        </footer>
      </div>
    `
  }

  private _handleYearChange(event: CustomEvent<{ year: string }>): void {
    this.selectedYear = event.detail.year

    this.dispatchEvent(
      new CustomEvent('year-change', {
        detail: {
          year: this.selectedYear
        },
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleYearAdd(): void {
    this.dispatchEvent(
      new CustomEvent('year-add', {
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleRowFocus(event: CustomEvent<{ row: Entry }>): void {
    this.dispatchEvent(
      new CustomEvent('row-focus', {
        detail: event.detail,
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleRowDelete(event: CustomEvent<{ row: Entry }>): void {
    this.dispatchEvent(
      new CustomEvent('row-delete', {
        detail: event.detail,
        bubbles: true,
        composed: true
      })
    )
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 0;
    }

    .ledger-view {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
    }

    .ledger-header {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--color-surface, #ffffff);
      border-bottom: 1px solid var(--color-border, #d9dde3);
    }

    .ledger-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .ledger-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 1rem;
      color: var(--color-text-secondary, #4a5568);
    }

    .ledger-stats strong {
      color: var(--color-text, #1a202c);
    }

    .table-container {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      padding: 1%;
    }

    .year-selector-container {
      flex: none;
      flex-shrink: 0;
      border-top: 1px solid var(--color-border, #d9dde3);
      background: var(--color-surface, #ffffff);
    }
  `
}
