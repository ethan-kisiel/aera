import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('notes-input')
export class NotesInput extends LitElement {
    /**
     * Current value of the notes field.
     */
    @property({ type: String })
    public value = '';

    /**
     * Placeholder displayed when the field is empty.
     */
    @property({ type: String })
    public placeholder = '';

    /**
     * Maximum number of characters allowed.
     */
    @property({ type: Number })
    public maxLength = 500;

    /**
     * Whether the input is currently invalid.
     *
     * This can be controlled by the parent component.
     */
    @property({ type: Boolean })
    public invalid = false;

    public static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .container {
            position: relative;
            width: 100%;
        }

        textarea {
            width: 100%;
            min-height: 90px;

            box-sizing: border-box;

            padding: 9px 10px 25px;

            border: 1px solid #d5d9de;
            border-radius: 7px;

            background: #ffffff;
            color: #1f2937;

            font: inherit;
            font-size: 13px;
            line-height: 1.5;

            outline: none;

            resize: vertical;

            transition:
                border-color 120ms ease,
                box-shadow 120ms ease;
        }

        textarea:hover {
            border-color: #c4c9d0;
        }

        textarea:focus {
            border-color: #2563eb;

            box-shadow:
                0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        textarea::placeholder {
            color: #b0b5bc;
        }

        textarea.invalid {
            border-color: #ef4444;

            box-shadow:
                0 0 0 3px rgba(239, 68, 68, 0.08);
        }

        .character-count {
            position: absolute;

            right: 9px;
            bottom: 7px;

            color: #9ca3af;

            font-size: 10px;
            line-height: 1;

            pointer-events: none;

            user-select: none;
        }

        .character-count.limit {
            color: #dc2626;
        }
    `;

    protected render() {
        const characterCount = this.value.length;
        const atLimit =
            this.maxLength > 0 &&
            characterCount >= this.maxLength;

        return html`
            <div class="container">
                <textarea
                    .value=${this.value}
                    placeholder=${this.placeholder}
                    maxlength=${this.maxLength > 0
                        ? this.maxLength
                        : nothing}
                    aria-invalid=${this.invalid}
                    aria-describedby="character-count"
                    @input=${this._handleInput}
                    @change=${this._handleChange}
                ></textarea>

                <span
                    id="character-count"
                    class=${atLimit
                        ? 'character-count limit'
                        : 'character-count'}
                >
                    ${characterCount}/${this.maxLength}
                </span>
            </div>
        `;
    }

    private _handleInput(event: Event): void {
        const textarea =
            event.target as HTMLTextAreaElement;

        this.value = textarea.value;

        this.dispatchEvent(
            new Event('input', {
                bubbles: true,
                composed: true,
            }),
        );
    }

    private _handleChange(event: Event): void {
        const textarea =
            event.target as HTMLTextAreaElement;

        this.value = textarea.value;

        this.dispatchEvent(
            new Event('change', {
                bubbles: true,
                composed: true,
            }),
        );
    }
}