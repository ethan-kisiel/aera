import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'

// Map the preload bridge to the Window object
declare global {
  interface Window { api: { fetchGreeting: () => Promise<string> } }
}

@customElement('my-app')
export class MyApp extends LitElement {
  @state()
  private greeting = 'Loading...'

  static styles = css`
    :host { display: block; font-family: sans-serif; padding: 2rem; }
    h1 { color: #646cff; }
  `

  async connectedCallback() {
    super.connectedCallback()
    this.greeting = await window.api.fetchGreeting()
  }

  render() {
    return html`
      <h1>Lit + Electron + C++</h1>
      <p>Native response: <strong>${this.greeting}</strong></p>
    `
  }
}