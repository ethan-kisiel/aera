import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('date-input')
export class DateInput extends LitElement {
    /**
     * ISO-8601 date value.
     *
     * Example:
     *
     *     2026-09-12
     *
     * An empty string represents an incomplete date.
     */
    @property({ type: String })
    public value = '';

    /**
     * Year displayed by the component.
     *
     * The year is not editable by the user.
     */
    @property({ type: Number })
    public year = new Date().getFullYear();

    /**
     * Whether the date is currently invalid.
     */
    @property({ type: Boolean })
    public invalid = false;

    @state()
    private _monthValue = '';

    @state()
    private _dayValue = '';

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

            box-shadow:
                0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .container.invalid {
            border-color: #ef4444;

            box-shadow:
                0 0 0 3px rgba(239, 68, 68, 0.08);
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
    `;

    protected willUpdate(
        changedProperties: Map<string | symbol, unknown>,
    ): void {
        if (changedProperties.has('value')) {
            this._syncFromValue();
        }
    }

    protected render() {
        return html`
            <div
                class=${`container ${
                    this.invalid ? 'invalid' : ''
                }`}
            >
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

                <span class="year">
                    ${this.year}
                </span>
            </div>
        `;
    }

    private _handleMonthInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        let value = this._sanitize(input.value);

        /*
         * A month beginning with 2-9 can only be a single-digit
         * month, so automatically prefix it with zero.
         *
         *     1  -> wait for another digit
         *     0  -> wait for another digit
         *     2  -> 02
         *     9  -> 09
         */
        if (
            value.length === 1 &&
            value !== '0' &&
            value !== '1'
        ) {
            value = `0${value}`;

            input.value = value;

            this._monthValue = value;
            this.monthComplete();
            return;
        }

        input.value = value;
        this._monthValue = value;

        /*
         * Automatically complete a single-digit month when
         * the user types 0X or 1X.
         */
        if (value.length === 2) {
            const month = Number(value);

            if (month >= 1 && month <= 12) {
                this.monthComplete();
            }
        }

        this._updateValidity();
        this._updateIsoValue();
    }

    private _handleDayInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        let value = this._sanitize(input.value);

        /*
         * A day beginning with 4-9 can only be a single-digit
         * day, so prefix it with zero.
         *
         *     4 -> 04
         *     9 -> 09
         */
        if (
            value.length === 1 &&
            value !== '0' &&
            value !== '1' &&
            value !== '2' &&
            value !== '3'
        ) {
            value = `0${value}`;

            input.value = value;

            this._dayValue = value;
            this.dayComplete();
            return;
        }

        input.value = value;
        this._dayValue = value;

        /*
         * Once we have two digits, complete the day.
         *
         * Importantly, this does NOT require a month to
         * already exist. The day can be entered first.
         */
        if (value.length === 2) {
            const day = Number(value);

            if (day >= 1 && day <= 31) {
                this.dayComplete();
            }
        }

        this._updateValidity();
        this._updateIsoValue();
    }

    private monthComplete(): void {
        const month = Number(this._monthValue);

        if (month < 1 || month > 12) {
            this._updateValidity();
            return;
        }

        this._updateValidity();
        this._updateIsoValue();
        this._focusDay();
    }

    private dayComplete(): void {
        const day = Number(this._dayValue);

        if (day < 1 || day > 31) {
            this._updateValidity();
            return;
        }

        /*
         * If a month has already been supplied, validate the
         * day against the actual number of days in that month.
         *
         * If the month hasn't been supplied yet, don't reject
         * the day. This allows DD to be entered first.
         */
        this._updateValidity();
        this._updateIsoValue();
    }

    private _handleMonthKeyDown(event: KeyboardEvent): void {
        if (
            event.key === 'ArrowRight' ||
            event.key === 'Enter'
        ) {
            event.preventDefault();

            this._focusDay();

            return;
        }

        if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp'
        ) {
            return;
        }
    }

    private _handleDayKeyDown(event: KeyboardEvent): void {
        if (
            event.key === 'ArrowLeft' &&
            this._dayValue.length === 0
        ) {
            event.preventDefault();

            this._focusMonth();

            return;
        }

        if (
            event.key === 'Backspace' &&
            this._dayValue.length === 0
        ) {
            event.preventDefault();

            this._focusMonth();

            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            this._updateValidity();
            this._updateIsoValue();
        }
    }

    private _focusMonth(): void {
        const input =
            this.renderRoot.querySelector(
                '.month',
            );

        if (input instanceof HTMLInputElement) {
            input.focus();
            input.select();
        }
    }

    private _focusDay(): void {
        const input =
            this.renderRoot.querySelector(
                '.day',
            );

        if (input instanceof HTMLInputElement) {
            input.focus();
            input.select();
        }
    }

    private _sanitize(value: string): string {
        return value
            .replace(/\D/g, '')
            .slice(0, 2);
    }

    private _daysInMonth(): number {
        const month = Number(this._monthValue);

        if (
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            return 31;
        }

        return new Date(
            this.year,
            month,
            0,
        ).getDate();
    }

    private _updateValidity(): void {
        const month =
            this._monthValue.length === 2
                ? Number(this._monthValue)
                : null;

        const day =
            this._dayValue.length === 2
                ? Number(this._dayValue)
                : null;

        /*
         * Don't mark an incomplete date invalid simply because
         * the user hasn't finished typing it.
         */
        if (month === null || day === null) {
            this.invalid = false;
            return;
        }

        this.invalid =
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > this._daysInMonth();
    }

    private _updateIsoValue(): void {
        /*
         * Don't produce an ISO date until both components exist.
         */
        if (
            this._monthValue.length !== 2 ||
            this._dayValue.length !== 2 ||
            this.invalid
        ) {
            this.value = '';
            return;
        }

        const month = Number(this._monthValue);
        const day = Number(this._dayValue);

        if (
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > this._daysInMonth()
        ) {
            this.value = '';
            return;
        }

        this.value =
            `${this.year}-` +
            `${this._monthValue}-` +
            `${this._dayValue}`;

        this.dispatchEvent(
            new CustomEvent(
                'change',
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        value: this.value,
                    },
                },
            ),
        );
    }

    private _syncFromValue(): void {
        /*
         * Only accept a complete ISO date matching the
         * currently displayed year.
         */
        const match =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                this.value,
            );

        if (!match) {
            this._monthValue = '';
            this._dayValue = '';
            return;
        }

        const [
            ,
            year,
            month,
            day,
        ] = match;

        /*
         * The year is controlled by the component, so don't
         * populate MM/DD from an ISO value belonging to
         * another year.
         */
        if (Number(year) !== this.year) {
            this._monthValue = '';
            this._dayValue = '';
            return;
        }

        this._monthValue = month;
        this._dayValue = day;

        this._updateValidity();
    }
}