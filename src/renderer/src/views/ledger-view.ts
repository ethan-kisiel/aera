// ledger-view.ts

import { LitElement, css, html } from 'lit'
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
      formatValue: (value) => {
        if (typeof value !== 'number') {
          return ''
        }

        let convertedValue = `${value}`.padStart(3, '0').split('').reverse()

        convertedValue.splice(2, 0, '.')

        const convertedString = convertedValue.reverse().join('')
        return `$${convertedString}`
      }
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

  protected override render() {
    return html`
      <div class="ledger-view">
        <section class="table-container">
          <simple-table
            .rows=${this.rows}
            .columns=${this._columns}
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

  private _handleYearChange(event: CustomEvent<{ year: string }>) {
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

  private _handleYearAdd() {
    this.dispatchEvent(
      new CustomEvent('year-add', {
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleRowFocus(event: CustomEvent<{ row: Entry }>) {
    this.dispatchEvent(
      new CustomEvent('row-focus', {
        detail: event.detail,
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleRowDelete(event: CustomEvent<{ row: Entry }>) {
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
