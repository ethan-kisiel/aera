import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/autocomplete-input'
import './components/notes-input'
import './components/simple-table'
import './components/date-input'
import './components/money-input'
import './components/year-selector'
import { TableColumn } from './components/simple-table'
import { Entry } from '../../types/shared-types'


interface LedgerEntry {
    date: string;
    category: string;
    amount: number;
}

const columns: TableColumn<LedgerEntry>[] = [
    {
        key: 'date',
        header: 'Date',
        width: '110px',
        getValue: (entry) => entry.date,
    },

    {
        key: 'category',
        header: 'Category',
        width: '160px',
        getValue: (entry) => entry.category,
    },

    {
        key: 'amount',
        header: 'Amount',
        width: '100px',

        getValue: (entry) => entry.amount,

        formatValue: (value) =>
            Number(value).toFixed(2),
    },
];

@customElement('aera-app')
export class AeraApp extends LitElement {
  @state()
  private greeting = 'Loading...'

  @state()
  private allData: Entry[] = []

  private categories = [
    'Food',
    'Entertainment',
    'Housing',
    'Insurance',
    'Medical',
    'Miscellaneous',
    'Transportation',
    'Utilities',
  ];
  private category = "";
  private notes = "";

  private _years = [
    '2026',
    '2025',
    '2024',
    '2023',
  ];

  private _selectedYear = '2026';

  static styles = css`
  `

  async connectedCallback() {
    super.connectedCallback()
    this.greeting = JSON.stringify(await window.ledgerApi.createEntry({
      id: -1,
      amount: 100,
      date: "2026-11-23",
      check_number: "1111",
      checkbook: "checkbook",
      category: "category",
      subcategory: "subcategory",
      itemization: "itemization",
      notes: "note"
    }))
    console.log(this.greeting);
    this.allData = await window.ledgerApi.getAll()
  }

  render() {
    return html`
    <autocomplete-input
    .items=${this.categories}
    .value=${this.category}
    placeholder="Category"
    autocomplete="on"
    @input=${() => {}}
    @change=${() => {}}>
    </autocomplete-input>

    <date-input
    .year=${2026}>
    </date-input>

    <money-input></money-input>
    
    <notes-input
    .value=${this.notes}
    .maxLength=${50}
    placeholder="Optional notes..."></notes-input>

    <simple-table
    .rows=${this.allData}
    .columns=${columns}
    @row-focus=${() => {}}
    @row-delete=${() => {}}></simple-table>
    <year-selector
    .years=${this._years}
    .selectedYear=${this._selectedYear}
    @year-change=${() => {}}
    @year-add=${() => {}}
    ></year-selector>
    `
  }
}