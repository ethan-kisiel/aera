import { LitElement, TemplateResult, css, html, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

export interface SearchChangeEvent {
  value: string
}

@customElement('search-bar')
export class SearchBar extends LitElement {
  @property({ type: String })
  public value = ''

  @property({ type: String })
  public placeholder = 'Search'

  @property({ type: Boolean })
  public disabled = false

  @property({ type: Boolean })
  public autofocus = false

  @query('input')
  private _input!: HTMLInputElement

  protected firstUpdated(): void {
    if (this.autofocus) {
      this._input.focus()
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="search">
        <span class="icon" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <circle cx="6.75" cy="6.75" r="4.5"></circle>
            <path d="M10 10l3.25 3.25"></path>
          </svg>
        </span>

        <input
          type="search"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.placeholder}
          autocomplete="off"
          spellcheck="false"
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
        />

        ${
          this.value
            ? html`
                <button class="clear" type="button" aria-label="Clear search" @click=${this._clear}>
                  <svg viewBox="0 0 16 16">
                    <path d="M4.5 4.5l7 7"></path>
                    <path d="M11.5 4.5l-7 7"></path>
                  </svg>
                </button>
              `
            : nothing
        }
      </div>
    `
  }

  private _handleInput(event: Event): void {
    const input = event.currentTarget as HTMLInputElement
    this.value = input.value

    this._dispatchChange()
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return
    }

    this.dispatchEvent(
      new CustomEvent<SearchChangeEvent>('search-submit', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value
        }
      })
    )
  }

  private _clear(): void {
    this.value = ''
    this._dispatchChange()
    this._input.focus()
  }

  private _dispatchChange(): void {
    this.dispatchEvent(
      new CustomEvent<SearchChangeEvent>('search-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value
        }
      })
    )
  }

  public focus(): void {
    this._input.focus()
  }

  public clear(): void {
    this._clear()
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    .search {
      display: flex;
      align-items: center;
      border-radius: 8px;

      width: 260px;
      height: 30px;

      box-sizing: border-box;

      background: #ffffff;
      border: 1px solid #cfcfcf;
      transition: border-color 100ms ease;
    }

    .search:focus-within {
      border-color: #8caee8;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 30px;
      height: 100%;

      color: #777;
      flex: 0 0 30px;
      pointer-events: none;
    }

    .icon svg {
      width: 14px;
      height: 14px;

      fill: none;
      stroke: currentColor;
      stroke-width: 1.25;
      stroke-linecap: round;
    }

    input {
      min-width: 0;
      flex: 1;

      height: 100%;
      padding: 0;

      border: 0;
      outline: 0;
      background: transparent;

      color: #222;
      font: inherit;
      font-size: 13px;
    }

    input::placeholder {
      color: #999;
      opacity: 1;
    }

    input::-webkit-search-cancel-button {
      display: none;
    }

    .clear {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 28px;
      height: 100%;
      padding: 0;

      border: 0;
      background: transparent;

      color: #888;
      cursor: pointer;
    }

    .clear:hover {
      color: #333;
    }

    .clear:focus-visible {
      outline: 1px solid #8caee8;
      outline-offset: -3px;
    }

    .clear svg {
      width: 13px;
      height: 13px;

      fill: none;
      stroke: currentColor;
      stroke-width: 1.25;
      stroke-linecap: round;
    }

    .search:has(input:disabled) {
      background: #f5f5f5;
      opacity: 0.65;
    }

    input:disabled {
      cursor: not-allowed;
    }
  `
}
