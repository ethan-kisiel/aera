import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('autocomplete-input')
export class AutocompleteInput extends LitElement {
    /**
     * Current value of the input.
     */
    @property({ type: String })
    public value = '';

    /**
     * Available autocomplete values.
     */
    @property({ type: Array })
    public items: string[] = [];

    /**
     * Placeholder displayed when the input is empty.
     */
    @property({ type: String })
    public placeholder = '';

    /**
     * Maximum number of suggestions displayed.
     */
    @property({ type: Number })
    public maxResults = 8;

    /**
     * Whether the suggestion dropdown is currently visible.
     */
    @state()
    private _isOpen = false;

    /**
     * Index of the currently highlighted suggestion.
     */
    @state()
    private _highlightedIndex = 0;

    /**
     * Suggestions matching the current input.
     */
    @state()
    private _matches: string[] = [];

    public static styles = css`
        :host {
            position: relative;
            display: block;
            width: 100%;
        }

        .container {
            position: relative;
            width: 100%;
        }

        input {
            width: 100%;
            height: 36px;
            padding: 0 10px;

            box-sizing: border-box;

            border: 1px solid #d5d9de;
            border-radius: 7px;

            background: #ffffff;
            color: #1f2937;

            font: inherit;
            font-size: 13px;

            outline: none;

            transition:
                border-color 120ms ease,
                box-shadow 120ms ease;
        }

        input:hover {
            border-color: #c4c9d0;
        }

        input:focus {
            border-color: #2563eb;

            box-shadow:
                0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .dropdown {
            position: absolute;
            z-index: 1000;

            top: calc(100% + 4px);
            left: 0;
            right: 0;

            max-height: 240px;
            overflow-y: auto;

            padding: 4px;

            background: #ffffff;

            border: 1px solid #e2e5e9;
            border-radius: 7px;

            box-shadow:
                0 6px 16px rgba(0, 0, 0, 0.10);
        }

        .option {
            display: flex;
            align-items: center;

            min-height: 34px;
            padding: 0 9px;

            border-radius: 5px;

            color: #1f2937;

            font-size: 13px;

            cursor: pointer;
            user-select: none;
        }

        .option:hover,
        .option.highlighted {
            background: #f1f5f9;
        }

        .option.selected {
            color: #2563eb;
        }
    `;

    protected render() {
        return html`
            <div class="container">
                <input
                    .value=${this.value}
                    placeholder=${this.placeholder}
                    autocomplete="off"
                    @input=${this._handleInput}
                    @keydown=${this._handleKeyDown}
                    @focus=${this._handleFocus}
                    @blur=${this._handleBlur}
                />

                ${this._isOpen && this._matches.length > 0
                    ? html`
                          <div
                              class="dropdown"
                              role="listbox"
                          >
                              ${this._matches.map(
                                  (item, index) => html`
                                      <div
                                          class=${`
                                              option
                                              ${
                                                  index ===
                                                  this._highlightedIndex
                                                      ? 'highlighted'
                                                      : ''
                                              }
                                              ${
                                                  item === this.value
                                                      ? 'selected'
                                                      : ''
                                              }
                                          `}
                                          role="option"
                                          aria-selected=${item === this.value}
                                          @mousedown=${(
                                              event: MouseEvent,
                                          ) =>
                                              this._selectFromMouse(
                                                  event,
                                                  item,
                                              )}
                                      >
                                          ${item}
                                      </div>
                                  `,
                              )}
                          </div>
                      `
                    : nothing}
            </div>
        `;
    }

    private _handleInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        this.value = input.value;

        this._updateMatches();

        this.dispatchEvent(
            new Event('input', {
                bubbles: true,
                composed: true,
            }),
        );
    }

    private _handleFocus(): void {
        this._updateMatches();
    }

    private _handleBlur(): void {
        /*
         * Delay closing the dropdown so that a mouse click
         * on a suggestion can be processed first.
         */
        window.setTimeout(() => {
            this._isOpen = false;
        }, 100);
    }

    private _handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowDown':
                this._handleArrowDown(event);
                break;

            case 'ArrowUp':
                this._handleArrowUp(event);
                break;

            case 'Enter':
                this._handleEnter(event);
                break;

            case 'Tab':
                this._handleTab();
                break;

            case 'Escape':
                this._isOpen = false;
                break;
        }
    }

    private _handleArrowDown(event: KeyboardEvent): void {
        if (!this._isOpen || this._matches.length === 0) {
            this._updateMatches();
            return;
        }

        event.preventDefault();

        this._highlightedIndex =
            (this._highlightedIndex + 1) %
            this._matches.length;
    }

    private _handleArrowUp(event: KeyboardEvent): void {
        if (!this._isOpen || this._matches.length === 0) {
            return;
        }

        event.preventDefault();

        this._highlightedIndex =
            (this._highlightedIndex - 1 + this._matches.length) %
            this._matches.length;
    }

    private _handleEnter(event: KeyboardEvent): void {
        if (!this._isOpen || this._matches.length === 0) {
            return;
        }

        event.preventDefault();

        this._select(
            this._matches[this._highlightedIndex],
        );
    }

    private _handleTab(): void {
        if (!this._isOpen || this._matches.length === 0) {
            return;
        }

        /*
         * Do not preventDefault().
         *
         * This allows the browser to continue moving focus
         * to the next form field after accepting the suggestion.
         */
        this._select(
            this._matches[this._highlightedIndex],
        );
    }

    private _updateMatches(): void {
        const query = this.value.trim().toLowerCase();

        if (this.items.length === 0) {
            this._matches = [];
            this._isOpen = false;
            return;
        }

        this._matches = this.items
            .filter((item) => {
                const normalizedItem =
                    item.toLowerCase();

                /*
                 * Prefix matching:
                 *
                 * "tra" -> "Transportation"
                 *
                 * "port" -> no match
                 */
                return (
                    normalizedItem.startsWith(query) &&
                    normalizedItem !== query
                );
            })
            .slice(0, this.maxResults);

        this._highlightedIndex = 0;

        this._isOpen = this._matches.length > 0;
    }

    private _selectFromMouse(
        event: MouseEvent,
        item: string,
    ): void {
        event.preventDefault();

        this._select(item);
    }

    private _select(item: string): void {
        this.value = item;

        this._isOpen = false;
        this._highlightedIndex = 0;

        /*
         * Dispatch change so the parent component knows
         * that a value was committed.
         */
        this.dispatchEvent(
            new Event('change', {
                bubbles: true,
                composed: true,
            }),
        );

        this.requestUpdate();
    }
}