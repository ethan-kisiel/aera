import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../components/autocomplete-input'
import '../components/notes-input'
import '../components/simple-table'
import { TableColumn } from '../components/simple-table'

interface Entry {
  id: number,
  amount: number,
  date: string,
  check_number: string,
  checkbook: string,
  category: string,
  subcategory: string,
  itemization: string, 
  notes: string
}
// Map the preload bridge to the Window object
declare global {
  interface Window {
    api: { 
      fetchGreeting: () => Promise<string>,
      createEntry: () => Promise<Entry>
      getAll: () => Promise<Entry[]>
    } 
  }
}

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

  static styles = css`
  `

  async connectedCallback() {
    super.connectedCallback()
    this.greeting = JSON.stringify(await window.api.createEntry())
    this.allData = await window.api.getAll()
  }

  render() {
    return html`
      <h1>Lit + Electron + C++</h1>
      <p>Native response: <strong>${this.greeting}</strong></p>
      
    <autocomplete-input
    .items=${this.categories}
    .value=${this.category}
    placeholder="Category"
    autocomplete="on"
    @input=${() => {}}
    @change=${() => {}}>
    </autocomplete-input>


    <notes-input
    .value=${this.notes}
    .maxLength=${50}
    placeholder="Optional notes..."></notes-input>

    <simple-table
    .rows=${this.allData}
    .columns=${columns}
    @row-focus=${() => {}}
    @row-delete=${() => {}}></simple-table>
    `
  }
}