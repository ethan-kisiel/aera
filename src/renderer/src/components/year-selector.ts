import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('year-selector')
export class YearSelector extends LitElement {
  /**
   * Years displayed by the selector.
   *
   * The component sorts these by their numeric year value,
   * with the most recent year appearing first.
   */
  @property({ type: Array })
  public years: string[] = []

  /**
   * The currently selected year.
   */
  @property({ type: String })
  public selectedYear = ''

  /**
   * Emits when the selected year changes.
   */
  private _selectYear(year: string): void {
    if (year === this.selectedYear) {
      return
    }

    this.selectedYear = year

    this.dispatchEvent(
      new CustomEvent('year-change', {
        bubbles: true,
        composed: true,
        detail: {
          year,
        },
      }),
    )
  }

  private _handleAddYear(): void {
    this.dispatchEvent(
      new CustomEvent('year-add', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _getSortedYears(): string[] {
    return [...this.years].sort((a, b) => this._getYearValue(b) - this._getYearValue(a))
  }

  private _getYearValue(year: string): number {
    /*
     * This allows strings such as:
     *
     * "2026"
     * "FY 2026"
     * "2026 Budget"
     *
     * to still sort correctly.
     */
    const match = year.match(/\d{4}/)

    if (!match) {
      return Number.NEGATIVE_INFINITY
    }

    return Number(match[0])
  }

  protected override render(): TemplateResult {
    const sortedYears = this._getSortedYears()

    return html`
      <nav class="year-selector" aria-label="Years">
        <button
          class="add-button"
          type="button"
          aria-label="Add year"
          title="Add year"
          @click=${this._handleAddYear}
        >
          <span aria-hidden="true">+</span>
        </button>

        <div class="years">
          ${sortedYears.map(
            (year) => html`
              <button
                class=${['year', year === this.selectedYear ? 'selected' : ''].join(' ')}
                type="button"
                aria-current=${year === this.selectedYear ? 'page' : 'false'}
                @click=${() => this._selectYear(year)}
              >
                ${year}
              </button>
            `,
          )}
        </div>
      </nav>
    `
  }

  static override styles = css`
    :host {
      display: block;
    }

    .year-selector {
      display: flex;
      align-items: stretch;

      width: 100%;
      min-height: 42px;

      border-bottom: 1px solid var(--color-border, #d0d5dd);

      background: var(--color-surface, #ffffff);
    }

    .add-button {
      display: flex;
      align-items: center;
      justify-content: center;

      flex: 0 0 42px;

      padding: 0;

      border: 0;
      border-right: 1px solid var(--color-border, #d0d5dd);

      background: transparent;

      color: var(--color-text-muted, #667085);

      font: inherit;
      font-size: 20px;
      font-weight: 400;

      cursor: pointer;

      transition:
        background-color 120ms ease,
        color 120ms ease;
    }

    .add-button:hover {
      background: var(--color-surface-hover, #f2f4f7);

      color: var(--color-text, #101828);
    }

    .add-button:focus-visible {
      position: relative;
      z-index: 1;

      outline: 2px solid var(--color-primary, #2563eb);

      outline-offset: -2px;
    }

    .years {
      display: flex;
      align-items: stretch;

      min-width: 0;

      overflow-x: auto;
      overflow-y: hidden;

      padding-bottom: 2px;
    }

    .year {
      position: relative;

      flex: 0 0 auto;

      min-width: 80px;
      padding: 0 18px;

      border: 0;
      border-right: 1px solid var(--color-border, #eaecf0);

      background: transparent;

      color: var(--color-text-muted, #667085);

      font: inherit;
      font-size: 14px;
      font-weight: 500;

      cursor: pointer;

      transition:
        background-color 120ms ease,
        color 120ms ease;
    }

    .year:hover {
      background: var(--color-surface-hover, #f9fafb);

      color: var(--color-text, #101828);
    }

    .year.selected {
      color: var(--color-text, #101828);

      background: var(--color-surface-selected, #f2f4f7);

      font-weight: 600;
    }

    /*
         * The bottom border acts like Excel's active
         * worksheet indicator.
         */
    .year.selected::after {
      content: '';

      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;

      height: 2px;

      background: var(--color-primary, #2563eb);
    }

    .year:focus-visible {
      z-index: 1;

      outline: 2px solid var(--color-primary, #2563eb);

      outline-offset: -2px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'year-selector': YearSelector
  }
}
