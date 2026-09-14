import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/autocomplete-input';
import '../components/date-input';
import '../components/money-input';
import '../components/notes-input';
import { Entry } from '../../../types/shared-types';


@customElement('entry-input-ribbon')
export class EntryInputRibbon extends LitElement {

    private clearInput() {
        this.entry = {
            id: -1,
            date: '',
            checkbook: '',
            check_number: '',
            amount: undefined,
            category: '',
            subcategory: '',
            itemization: '',
            notes: '',
        };
    }

    @property({ type: Object })
    public entry: Partial<Entry> & {id: number} = {
        id: -1,
        date: '',
        checkbook: '',
        check_number: '',
        amount: undefined,
        category: '',
        subcategory: '',
        itemization: '',
        notes: '',
    };

    @property({ type: Number })
    public year = new Date().getFullYear();

    @property({ type: Array })
    public checkbooks: string[] = [];

    @property({ type: Array })
    public categories: string[] = [];

    @property({ type: Array })
    public subCategories: string[] = [];

    @property({ type: Array })
    public itemizations: string[] = [];

    @property({ type: Boolean })
    public disabled = false;

    protected override render() {
        return html`
            <form
                class="ribbon"
                @submit=${this._handleSubmit}
            >
                <button
                    class="close-button"
                    type="button"
                    aria-label="Close"
                    title="Close"
                    @click=${this._handleClose}
                >
                    <span aria-hidden="true">×</span>
                </button>

                <div class="fields">
                    <div class="field date-field">
                        <label>Date</label>

                        <date-input
                            .value=${this.entry.date}
                            .year=${this.year}
                            @change=${this._handleDateChange}
                        ></date-input>
                    </div>

                    <div class="field checkbook-field">
                        <label>Checkbook</label>

                        <autocomplete-input
                            .value=${this.entry.checkbook}
                            .items=${this.checkbooks}
                            @input=${this._handleCheckbookInput}
                        ></autocomplete-input>
                    </div>

                    <div class="field check-number-field">
                        <label for="check-number">Check #</label>

                        <input
                            id="check-number"
                            type="text"
                            inputmode="numeric"
                            placeholder="#"
                            autocomplete="off"
                            .value=${this.entry.check_number}
                            @input=${this._handleCheckNumberInput}
                        />
                    </div>

                    <div class="field amount-field">
                        <label>Amount</label>

                        <money-input
                            .value=${this.entry.amount}
                            @change=${this._handleAmountChange}
                        ></money-input>
                    </div>

                    <div class="field category-field">
                        <label>Category</label>

                        <autocomplete-input
                            .value=${this.entry.category}
                            .items=${this.categories}
                            @input=${this._handleCategoryInput}
                        ></autocomplete-input>
                    </div>

                    <div class="field sub-category-field">
                        <label>Subcategory</label>

                        <autocomplete-input
                            .value=${this.entry.subcategory}
                            .items=${this.subCategories}
                            @input=${this._handleSubCategoryInput}
                        ></autocomplete-input>
                    </div>

                    <div class="field itemization-field">
                        <label>Itemization</label>

                        <autocomplete-input
                            .value=${this.entry.itemization}
                            .items=${this.itemizations}
                            @input=${this._handleItemizationInput}
                        ></autocomplete-input>
                    </div>

                    <div class="field notes-field">
                        <label>Notes</label>

                        <notes-input
                            .value=${this.entry.notes}
                            @input=${this._handleNotesInput}
                        ></notes-input>
                    </div>
                </div>

                <div class="actions">
                    <button
                        class="save-button"
                        type="submit"
                        ?disabled=${this.disabled}
                    >
                        Save
                    </button>
                </div>
            </form>
        `;
    }

    private _handleDateChange(
        event: CustomEvent<{ value: string }>,
    ): void {
        this._updateEntry({
            date: event.detail.value,
        });
    }

    private _handleAmountChange(
        event: CustomEvent<{ value: number | null }>,
    ): void {
        this._updateEntry({
            amount: event.detail.value ?? undefined,
        });
    }

    private _handleCheckbookInput(event: Event): void {
        this._updateEntry({
            checkbook: this._getInputValue(event),
        });
    }

    private _handleCheckNumberInput(event: Event): void {
        this._updateEntry({
            check_number: this._getInputValue(event),
        });
    }

    private _handleCategoryInput(event: Event): void {
        this._updateEntry({
            category: this._getInputValue(event),
        });
    }

    private _handleSubCategoryInput(event: Event): void {
        this._updateEntry({
            subcategory: this._getInputValue(event),
        });
    }

    private _handleItemizationInput(event: Event): void {
        this._updateEntry({
            itemization: this._getInputValue(event),
        });
    }

    private _handleNotesInput(event: Event): void {
        this._updateEntry({
            notes: this._getInputValue(event),
        });
    }

    private _getInputValue(event: Event): string {
        /*
         * Both the autocomplete-input and notes-input expose
         * their current value through the element itself.
         */
        return (event.currentTarget as HTMLInputElement).value;
    }

    private _updateEntry(
        changes: Partial<Entry>,
    ): void {
        this.entry = {
            ...this.entry,
            ...changes,
        };

        this.dispatchEvent(
            new CustomEvent('entry-change', {
                bubbles: true,
                composed: true,
                detail: {
                    entry: this.entry,
                },
            }),
        );
    }

    private _handleSubmit(event: SubmitEvent): void {
        event.preventDefault();
        console.log("HANDLEING SUBMIT")

        if (this.disabled || !this._isValid()) {
            return;
        }

        this.dispatchEvent(
            new CustomEvent('save', {
                bubbles: true,
                composed: true,
                detail: {
                    entry: this.entry,
                },
            }),
        );

        this.clearInput();
    }

    private _handleClose(): void {
        this.dispatchEvent(
            new CustomEvent('close', {
                bubbles: true,
                composed: true,
            }),
        );
    }

    private _isValid(): boolean {
        return (
            this.entry.date !== undefined &&
            this.entry.date.length > 0 &&
            this.entry.amount !== null &&
            Number.isFinite(this.entry.amount)
        );
    }

    static override styles = css`
        :host {
            display: block;
        }

        .ribbon {
            position: relative;

            display: flex;
            align-items: flex-end;
            gap: 16px;

            box-sizing: border-box;
            width: 100%;
            padding: 16px;

            border: 1px solid
                var(--color-border, #d0d5dd);
            border-radius: 8px;

            background: var(
                --color-surface,
                #ffffff
            );

            box-shadow:
                0 1px 2px rgb(16 24 40 / 4%);
        }

        .fields {
            display: grid;
            grid-template-columns:
                auto
                minmax(120px, 1fr)
                90px
                auto
                minmax(120px, 1fr)
                minmax(120px, 1fr)
                minmax(140px, 1fr)
                minmax(120px, 1.5fr);

            align-items: start;

            flex: 1;
            min-width: 0;

            gap: 12px;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 6px;

            min-width: 0;
        }

        label {
            color: var(
                --color-text-muted,
                #667085
            );

            font-size: 12px;
            font-weight: 500;
            line-height: 1;
        }

        input::placeholder {
            color: var(--color-text-muted, #98a2b3)
        }


        input {
            box-sizing: border-box;

            width: 100%;
            height: 36px;

            padding: 0 10px;

            border: 1px solid
                var(--color-border, #d0d5dd);
            border-radius: 6px;

            outline: none;

            background: var(
                --color-surface,
                #ffffff
            );

            color: var(
                --color-text,
                #101828
            );

            font: inherit;

            transition:
                border-color 120ms ease,
                box-shadow 120ms ease;
        }

        input:hover {
            border-color: var(
                --color-border-hover,
                #98a2b3
            );
        }

        input:focus {
            border-color: var(
                --color-primary,
                #2563eb
            );

            box-shadow:
                0 0 0 3px
                color-mix(
                    in srgb,
                    var(--color-primary, #2563eb) 12%,
                    transparent
                );
        }

        .actions {
            flex: 0 0 auto;
        }

        .save-button {
            height: 36px;

            padding: 0 18px;

            border: 1px solid
                var(--color-primary, #2563eb);
            border-radius: 6px;

            background: var(
                --color-primary,
                #2563eb
            );

            color: #ffffff;

            font: inherit;
            font-size: 14px;
            font-weight: 600;

            cursor: pointer;

            transition:
                background-color 120ms ease,
                border-color 120ms ease,
                opacity 120ms ease;
        }

        .save-button:hover:not(:disabled) {
            background: var(
                --color-primary-hover,
                #1d4ed8
            );

            border-color: var(
                --color-primary-hover,
                #1d4ed8
            );
        }

        .save-button:focus-visible {
            outline: 2px solid
                var(--color-primary, #2563eb);

            outline-offset: 2px;
        }

        .save-button:disabled {
            opacity: 0.5;
            cursor: default;
        }

        .close-button {
            position: absolute;
            top: 8px;
            right: 8px;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 24px;
            height: 24px;

            padding: 0;

            border: 1px solid transparent;
            border-radius: 4px;

            background: transparent;

            color: var(
                --color-text-muted,
                #98a2b3
            );

            font: inherit;
            font-size: 18px;
            font-weight: 400;
            line-height: 1;

            cursor: pointer;

            transition:
                color 120ms ease,
                background-color 120ms ease,
                border-color 120ms ease;
        }

        .close-button:hover {
            border-color: var(
                --color-danger-border,
                #fecdca
            );

            background: var(
                --color-danger-surface,
                #fef3f2
            );

            color: var(
                --color-danger,
                #d92d20
            );
        }

        .close-button:focus-visible {
            outline: 2px solid
                var(--color-danger, #d92d20);

            outline-offset: 1px;
        }

        @media (max-width: 1200px) {
            .ribbon {
                align-items: stretch;
                flex-direction: column;
            }

            .fields {
                grid-template-columns:
                    repeat(4, minmax(0, 1fr));
            }

            .actions {
                display: flex;
                justify-content: flex-end;
            }
        }

        @media (max-width: 800px) {
            .fields {
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'entry-input-ribbon': EntryInputRibbon;
    }
}