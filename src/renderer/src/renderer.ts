import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../components/autocomplete-input'
import '../components/notes-input'

// Map the preload bridge to the Window object
declare global {
  interface Window {
    api: { 
      fetchGreeting: () => Promise<string>,
      createEntry: () => Promise<{id: number,
        amount: number,
        date: string,
        check_number: string,
        checkbook: string,
        category: string,
        subcategory: string,
        itemization: string, 
        notes: string}>
    } 
  }
}

@customElement('aera-app')
export class AeraApp extends LitElement {
  @state()
  private greeting = 'Loading...'
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
    `
  }
}