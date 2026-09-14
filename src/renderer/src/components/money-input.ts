import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('money-input')
export class MoneyInput extends LitElement {
    /**
     * The committed monetary value in dollars.
     *
     * Examples:
     * 1234.56
     * 10
     * 0.5
     */
    @property({ type: Number })
    public value: number | null = null;

    /**
     * Whether the input should be displayed as invalid.
     */
    @property({ type: Boolean })
    public invalid = false;

    /**
     * Maximum number of digits allowed in the dollar portion.
     */
    @property({ type: Number })
    public maxDollarDigits = 12;

    /**
     * Dollar portion currently being edited.
     */
    @state()
    private _dollars = '';

    /**
     * Cents portion currently being edited.
     */
    @state()
    private _cents = '';

    private _lastCommittedValue: number | null = null;

    protected override willUpdate(
        changedProperties: Map<string | number | symbol, unknown>,
    ): void {
        if (changedProperties.has('value')) {
            this._syncFromCommittedValue();
        }
    }

    protected override firstUpdated(): void {
        this._syncFromCommittedValue();
    }

    protected override render() {
        return html`
            <div
                class="money-input"
                @focusout=${this._handleFocusOut}
            >
                <span class="currency">$</span>

                <input
                    class="money-part dollars"
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    maxlength=${this.maxDollarDigits}
                    aria-label="Dollars"
                    .value=${this._dollars}
                    @input=${this._handleDollarInput}
                    @keydown=${this._handleDollarKeyDown}
                />

                <span class="decimal">.</span>

                <input
                    class="money-part cents"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="2"
                    aria-label="Cents"
                    .value=${this._cents}
                    @input=${this._handleCentsInput}
                    @keydown=${this._handleCentsKeyDown}
                />
            </div>
        `;
    }

    private _handleDollarInput(event: Event): void {
        const input = event.currentTarget as HTMLInputElement;

        let value = this._digitsOnly(input.value);

        /*
         * Remove leading zeroes while retaining a single zero.
         *
         * 000123 -> 123
         * 000    -> 0
         */
        value = value.replace(/^0+(?=\d)/, '');

        value = value.slice(0, this.maxDollarDigits);

        this._dollars = value;
        input.value = value;

        this._updateValidity();
        this._tryCommit();
    }

    private _handleCentsInput(event: Event): void {
        const input = event.currentTarget as HTMLInputElement;

        const value = this
            ._digitsOnly(input.value)
            .slice(0, 2);

        this._cents = value;
        input.value = value;

        this._updateValidity();
        this._tryCommit();
    }

    private _handleDollarKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case '.':
            case ',':
                /*
                 * The decimal separator is visually present already.
                 * Pressing either "." or "," simply moves to cents.
                 */
                this._focusCents();
                event.preventDefault();
                break;

            case 'ArrowRight':
                this._focusCents();
                event.preventDefault();
                break;

            case 'ArrowDown':
                this._focusCents();
                event.preventDefault();
                break;

            case 'Tab':
                /*
                 * Allow normal Tab behavior.
                 */
                break;

            case 'Backspace':
                if (this._dollars.length === 0) {
                    this._focusCents();
                }

                break;

            case 'Enter':
                this._tryCommit();
                break;
        }
    }

    private _handleCentsKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                /*
                 * Only move back if the caret is at the beginning.
                 */
                const input = event.currentTarget as HTMLInputElement;

                if (input.selectionStart === 0) {
                    this._focusDollars();
                    event.preventDefault();
                }

                break;

            case 'ArrowUp':
                this._focusDollars();
                event.preventDefault();
                break;

            case 'Backspace':
                if (
                    this._cents.length === 0
                ) {
                    this._focusDollars();
                }

                break;

            case 'Enter':
                this._tryCommit();
                break;
        }
    }

    private _handleFocusOut(event: FocusEvent): void {
        const nextTarget = event.relatedTarget as Node | null;

        /*
         * Moving between dollars and cents should not normalize the
         * value yet.
         */
        if (
            nextTarget &&
            this.renderRoot.contains(nextTarget)
        ) {
            return;
        }

        this._normalizeValues();
        this._tryCommit();
    }

    private _normalizeValues(): void {
        let dollars = this._dollars;
        let cents = this._cents;

        /*
         * An empty dollar field is treated as zero when the component
         * loses focus and the user has entered cents.
         *
         * .50 -> 0.50
         */
        if (dollars.length === 0 && cents.length > 0) {
            dollars = '0';
        }

        /*
         * Pad a single cent digit when leaving the component.
         *
         * 12.5 -> 12.50
         */
        if (cents.length === 1) {
            cents = cents.padEnd(2, '0');
        }

        /*
         * If dollars exist but cents are empty, display zero cents.
         *
         * 12. -> 12.00
         */
        if (dollars.length > 0 && cents.length === 0) {
            cents = '00';
        }

        this._dollars = dollars;
        this._cents = cents;

        this._updateInputValues();
        this._updateValidity();
    }

    private _tryCommit(): void {
        /*
         * Nothing has been entered yet.
         */
        if (
            this._dollars.length === 0 &&
            this._cents.length === 0
        ) {
            this.invalid = false;

            if (this._lastCommittedValue !== null) {
                this._lastCommittedValue = null;
                this.value = null;

                this._dispatchChange();
            }

            return;
        }

        /*
         * Cents can be entered without dollars.
         *
         * .50 -> 0.50
         */
        const dollars = this._dollars;

        const cents = this._cents.length > 0
            ? this._cents.padEnd(2, '0')
            : '00';

        const value = Number.parseInt(`${dollars}${cents}`);

        if (!Number.isFinite(value)) {
            this.invalid = true;
            return;
        }

        this.invalid = false;

        if (value === this._lastCommittedValue) {
            return;
        }

        this._lastCommittedValue = value;
        this.value = value;

        this._dispatchChange();
    }

    private _dispatchChange(): void {
        this.dispatchEvent(
            new CustomEvent('change', {
                bubbles: true,
                composed: true,
                detail: {
                    value: this.value,
                },
            }),
        );
    }

    private _updateValidity(): void {
        if (
            this._dollars.length === 0 &&
            this._cents.length === 0
        ) {
            this.invalid = false;
            return;
        }

        const cents = Number(this._cents);

        this.invalid =
            !Number.isFinite(cents) ||
            cents > 99;
    }

    private _syncFromCommittedValue(): void {
        if (
            this.value === this._lastCommittedValue &&
            (
                this._dollars.length > 0 ||
                this._cents.length > 0
            )
        ) {
            return;
        }

        if (
            this.value === null ||
            !Number.isFinite(this.value)
        ) {
            this._dollars = '';
            this._cents = '';
            this._lastCommittedValue = this.value;

            return;
        }

        /*
         * Convert through integer cents to avoid floating-point
         * formatting issues such as:
         *
         * 12.3 -> 12.299999...
         */
        const totalCents = Math.round(
            this.value * 100,
        );

        const dollars = Math.floor(
            totalCents / 100,
        );

        const cents = totalCents % 100;

        this._dollars = String(dollars);
        this._cents = String(cents).padStart(2, '0');

        this._lastCommittedValue = this.value;

        this._updateValidity();
    }

    private _updateInputValues(): void {
        const dollarsInput = this.renderRoot.querySelector(
            '.dollars',
        ) as HTMLInputElement | null;

        const centsInput = this.renderRoot.querySelector(
            '.cents',
        ) as HTMLInputElement | null;

        if (dollarsInput) {
            dollarsInput.value = this._dollars;
        }

        if (centsInput) {
            centsInput.value = this._cents;
        }
    }

    private _focusDollars(): void {
        const input = this.renderRoot.querySelector(
            '.dollars',
        ) as HTMLInputElement | null;

        input?.focus();
    }

    private _focusCents(): void {
        const input = this.renderRoot.querySelector(
            '.cents',
        ) as HTMLInputElement | null;

        input?.focus();
        input?.select();
    }

    private _digitsOnly(value: string): string {
        return value.replace(/\D/g, '');
    }

    static override styles = css`
        :host {
            display: inline-block;
        }

        .money-input {
            display: inline-flex;
            align-items: center;

            height: 36px;
            box-sizing: border-box;

            border: 1px solid var(--color-border, #d0d5dd);
            border-radius: 6px;

            background: var(--color-surface, #ffffff);

            transition:
                border-color 120ms ease,
                box-shadow 120ms ease;
        }

        .money-input:focus-within {
            border-color: var(--color-primary, #2563eb);
            box-shadow:
                0 0 0 3px
                color-mix(
                    in srgb,
                    var(--color-primary, #2563eb) 12%,
                    transparent
                );
        }

        .currency {
            padding-left: 10px;

            color: var(--color-text-muted, #98a2b3);

            user-select: none;
        }

        .decimal {
            color: var(--color-text-muted, #98a2b3);
            user-select: none;
        }

        .money-part {
            padding: 0;

            border: 0;
            outline: 0;

            background: transparent;

            color: var(--color-text, #101828);

            font: inherit;
            font-variant-numeric: tabular-nums;

            text-align: right;
        }

        .dollars {
            width: 90px;
            margin-left: 4px;
        }

        .cents {
            width: 24px;
            margin-right: 8px;

            text-align: left;
        }

        .money-part::selection {
            background: var(--color-primary, #2563eb);
            color: #ffffff;
        }

        :host([invalid]) .money-input {
            border-color: var(--color-danger, #d92d20);
            box-shadow:
                0 0 0 3px
                color-mix(
                    in srgb,
                    var(--color-danger, #d92d20) 10%,
                    transparent
                );
        }

        :host([invalid]) .money-part {
            color: var(--color-danger, #b42318);
        }
    `;
}