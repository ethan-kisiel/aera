import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('date-input')
export class DateInput extends LitElement {
  /**
   * ISO-8601 date value.
   *
   * Example:
   *
   *     2026-09-12
   *
   * The public value is only updated when a complete,
   * valid date has been committed.
   */
  @property({ type: String })
  public value = ''

  /**
   * Year displayed by the component.
   *
   * The year is not editable by the user.
   */
  @property({ type: Number })
  public year = new Date().getFullYear()

  /**
   * Whether the date is currently invalid.
   */
  @property({ type: Boolean })
  public invalid = false

  @state()
  private _monthValue = ''

  @state()
  private _dayValue = ''

  /**
   * Prevents our own value changes from being interpreted
   * as external changes that should replace the editing draft.
   */
  private _internalValueChange = false

  public static styles = css`
    :host {
      display: inline-block;
    }

    .container {
      display: inline-flex;
      align-items: center;

      height: 36px;

      box-sizing: border-box;

      border: 1px solid #d5d9de;
      border-radius: 7px;

      background: #ffffff;

      transition:
        border-color 120ms ease,
        box-shadow 120ms ease;
    }

    .container:hover {
      border-color: #c4c9d0;
    }

    .container:focus-within {
      border-color: #2563eb;

      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .container.invalid {
      border-color: #ef4444;

      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
    }

    input {
      width: 24px;
      height: 34px;

      box-sizing: border-box;

      padding: 0;

      border: none;
      outline: none;

      background: transparent;

      color: #1f2937;

      font: inherit;
      font-size: 13px;

      text-align: center;

      font-variant-numeric: tabular-nums;
    }

    input::placeholder {
      color: #b0b5bc;
    }

    .month {
      margin-left: 7px;
    }

    .day {
      margin-right: 7px;
    }

    .separator {
      color: #c4c9d0;

      font-size: 13px;

      user-select: none;
    }

    .year {
      height: 34px;

      padding: 0 8px 0 7px;

      display: flex;
      align-items: center;

      border-left: 1px solid #e2e5e9;

      color: #a3a8b0;

      font-size: 13px;

      font-variant-numeric: tabular-nums;

      user-select: none;
    }
  `

  protected willUpdate(changedProperties: Map<string | symbol, unknown>): void {
    if (changedProperties.has('value') && !this._internalValueChange) {
      this._syncFromValue()
    }

    if (changedProperties.has('year')) {
      this._syncFromValue()
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class=${`container ${this.invalid ? 'invalid' : ''}`} @focusout=${this._handleFocusOut}>
        <input
          class="month"
          inputmode="numeric"
          autocomplete="off"
          maxlength="2"
          placeholder="MM"
          aria-label="Month"
          .value=${this._monthValue}
          @input=${this._handleMonthInput}
          @keydown=${this._handleMonthKeyDown}
        />

        <span class="separator">/</span>

        <input
          class="day"
          inputmode="numeric"
          autocomplete="off"
          maxlength="2"
          placeholder="DD"
          aria-label="Day"
          .value=${this._dayValue}
          @input=${this._handleDayInput}
          @keydown=${this._handleDayKeyDown}
        />

        <span class="year"> ${this.year} </span>
      </div>
    `
  }

  private _handleMonthInput(event: Event): void {
    const input = event.target as HTMLInputElement

    let value = this._sanitize(input.value)

    /*
     * 2-9 can only represent a single-digit month,
     * so immediately convert it to 02-09.
     */
    if (value.length === 1 && value !== '0' && value !== '1') {
      value = `0${value}`

      this._monthValue = value
      input.value = value

      this._updateValidity()
      this._commitIfValid()
      this._focusDay()

      return
    }

    input.value = value
    this._monthValue = value

    /*
     * 01-09 and 10-12 are complete months.
     */
    if (value.length === 2) {
      const month = Number(value)

      if (month >= 1 && month <= 12) {
        this._updateValidity()
        this._commitIfValid()
        this._focusDay()

        return
      }
    }

    this._updateValidity()
  }

  private _handleDayInput(event: Event): void {
    const input = event.target as HTMLInputElement

    let value = this._sanitize(input.value)

    /*
     * 4-9 can only represent a single-digit day,
     * so immediately convert it to 04-09.
     */
    if (value.length === 1 && value !== '0' && value !== '1' && value !== '2' && value !== '3') {
      value = `0${value}`

      this._dayValue = value
      input.value = value

      this._updateValidity()
      this._commitIfValid()

      return
    }

    input.value = value
    this._dayValue = value

    /*
     * Any two-digit day is potentially complete.
     */
    if (value.length === 2) {
      const day = Number(value)

      if (day >= 1 && day <= 31) {
        this._updateValidity()
        this._commitIfValid()

        return
      }
    }

    this._updateValidity()
  }

  private _handleFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget

    /*
     * Only normalize when focus is leaving the entire
     * date-input component, not when moving between
     * month and day.
     */
    if (nextTarget instanceof Node && this.contains(nextTarget)) {
      return
    }

    let changed = false

    /*
     * Normalize a one-digit month.
     *
     * 1 -> 01
     * 2 -> 02
     *
     * This intentionally happens even though the field
     * wasn't considered "complete" during typing.
     */
    if (this._monthValue.length === 1 && this._monthValue !== '0') {
      this._monthValue = this._monthValue.padStart(2, '0')

      changed = true
    }

    /*
     * Normalize a one-digit day.
     *
     * 1 -> 01
     * 2 -> 02
     * 3 -> 03
     */
    if (this._dayValue.length === 1 && this._dayValue !== '0') {
      this._dayValue = this._dayValue.padStart(2, '0')

      changed = true
    }

    if (changed) {
      this._updateValidity()
    }

    /*
     * Once focus leaves the component, try to commit
     * whatever valid date is present.
     */
    this._commitIfValid()
  }

  private _handleMonthKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      event.preventDefault()
      this._focusDay()

      return
    }
  }

  private _handleDayKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' && this._dayValue.length === 0) {
      event.preventDefault()
      this._focusMonth()

      return
    }

    if (event.key === 'Backspace' && this._dayValue.length === 0) {
      event.preventDefault()
      this._focusMonth()

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      this._updateValidity()
      this._commitIfValid()
    }
  }

  private _focusMonth(): void {
    const input = this.renderRoot.querySelector('.month')

    if (input instanceof HTMLInputElement) {
      input.focus()
      input.select()
    }
  }

  private _focusDay(): void {
    const input = this.renderRoot.querySelector('.day')

    if (input instanceof HTMLInputElement) {
      input.focus()
      input.select()
    }
  }

  private _sanitize(value: string): string {
    return value.replace(/\D/g, '').slice(0, 2)
  }

  private _daysInMonth(): number {
    const month = Number(this._monthValue)

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return 31
    }

    return new Date(this.year, month, 0).getDate()
  }

  private _updateValidity(): void {
    const month = this._monthValue.length === 2 ? Number(this._monthValue) : null

    const day = this._dayValue.length === 2 ? Number(this._dayValue) : null

    /*
     * A partially-entered value isn't invalid.
     */
    if (month === null || day === null) {
      this.invalid = false
      return
    }

    this.invalid = month < 1 || month > 12 || day < 1 || day > this._daysInMonth()
  }

  private _commitIfValid(): void {
    /*
     * Don't commit until both fields contain two digits.
     */
    if (this._monthValue.length !== 2 || this._dayValue.length !== 2) {
      return
    }

    const month = Number(this._monthValue)
    const day = Number(this._dayValue)

    if (month < 1 || month > 12 || day < 1 || day > this._daysInMonth()) {
      this.invalid = true
      return
    }

    const newValue = `${this.year}-${this._monthValue}-${this._dayValue}`

    /*
     * Don't emit another change if nothing actually changed.
     */
    if (this.value === newValue) {
      return
    }

    this._internalValueChange = true
    this.value = newValue
    this._internalValueChange = false

    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value
        }
      })
    )
  }

  private _syncFromValue(): void {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.value)

    /*
     * An empty external value means clear the draft.
     */
    if (!match) {
      this._monthValue = ''
      this._dayValue = ''
      this.invalid = false

      return
    }

    const [, year, month, day] = match

    /*
     * The year is controlled by the component.
     */
    if (Number(year) !== this.year) {
      this._monthValue = ''
      this._dayValue = ''
      this.invalid = false

      return
    }

    this._monthValue = month
    this._dayValue = day

    this._updateValidity()
  }
}
