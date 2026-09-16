import { LitElement, TemplateResult, css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface ModalAction {
  id: string
  label: string
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}

@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  public open = false

  @property({ type: String })
  public title = ''

  @property({ type: String })
  public message = ''

  @property({ type: Array })
  public actions: ModalAction[] = []

  @property({ type: Boolean })
  public closeOnBackdrop = true

  @property({ type: Boolean })
  public closeOnEscape = true

  protected override firstUpdated(): void {
    this.addEventListener('keydown', this._handleKeyDown)
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open')) {
      if (this.open) {
        this._focusModal()
      }
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.open) {
      return nothing
    }

    return html`
      <div class="backdrop" @mousedown=${this._handleBackdropMouseDown}>
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          @mousedown=${this._stopPropagation}
        >
          <header class="header">
            <h2 id="modal-title">${this.title}</h2>

            <button
              class="close-button"
              type="button"
              aria-label="Close"
              @click=${this._handleClose}
            >
              ×
            </button>
          </header>

          <div class="content">
            ${this.message ? html`<p>${this.message}</p>` : nothing}

            <slot></slot>
          </div>

          ${
            this.actions.length > 0
              ? html`
                  <footer class="actions">
                    ${this.actions.map(
                      (action) => html`
                        <button
                          type="button"
                          class=${this._getActionClass(action)}
                          ?disabled=${action.disabled}
                          @click=${() => this._handleAction(action)}
                        >
                          ${action.label}
                        </button>
                      `
                    )}
                  </footer>
                `
              : nothing
          }
        </section>
      </div>
    `
  }

  private _getActionClass(action: ModalAction): string {
    return `action-button ${action.variant ?? 'default'}`
  }

  private _handleAction(action: ModalAction): void {
    this.dispatchEvent(
      new CustomEvent('modal-action', {
        detail: {
          action: action.id
        },
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleClose(): void {
    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true
      })
    )
  }

  private _handleBackdropMouseDown(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this._handleClose()
    }
  }

  private _handleKeyDown = (event: KeyboardEvent): void => {
    if (this.open && this.closeOnEscape && event.key === 'Escape') {
      event.preventDefault()
      this._handleClose()
    }
  }

  private _stopPropagation(event: Event): void {
    event.stopPropagation()
  }

  private _focusModal(): void {
    requestAnimationFrame(() => {
      const closeButton = this.shadowRoot?.querySelector<HTMLButtonElement>('.close-button')

      closeButton?.focus()
    })
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 24px;

      background: rgb(0 0 0 / 35%);
    }

    .modal {
      width: min(480px, 100%);
      max-height: calc(100vh - 48px);

      display: flex;
      flex-direction: column;

      overflow: hidden;

      background: var(--color-surface, #ffffff);
      border: 1px solid var(--color-border, #d9dde3);
      border-radius: 6px;

      box-shadow:
        0 18px 50px rgb(0 0 0 / 18%),
        0 4px 12px rgb(0 0 0 / 8%);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 16px 18px;

      border-bottom: 1px solid var(--color-border, #d9dde3);
    }

    h2 {
      margin: 0;

      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;

      color: var(--color-text, #20242a);
    }

    .close-button {
      width: 28px;
      height: 28px;

      display: grid;
      place-items: center;

      padding: 0;

      border: 0;
      border-radius: 4px;

      background: transparent;
      color: var(--color-text-muted, #737a83);

      font-size: 22px;
      font-weight: 300;
      line-height: 1;

      cursor: pointer;
    }

    .close-button:hover {
      background: var(--color-danger-soft, #fbeaea);
      color: var(--color-danger, #c0392b);
    }

    .content {
      flex: 1 1 auto;

      padding: 20px;

      overflow: auto;
    }

    .content p {
      margin: 0;

      color: var(--color-text-secondary, #555d66);
      font-size: 14px;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      padding: 14px 18px;

      border-top: 1px solid var(--color-border, #d9dde3);
    }

    .action-button {
      min-width: 80px;

      padding: 7px 14px;

      border: 1px solid var(--color-border, #d9dde3);
      border-radius: 4px;

      background: var(--color-surface, #ffffff);
      color: var(--color-text, #20242a);

      font: inherit;
      font-size: 13px;
      font-weight: 500;

      cursor: pointer;
    }

    .action-button:hover:not(:disabled) {
      background: var(--color-surface-hover, #f5f6f7);
    }

    .action-button.primary {
      border-color: var(--color-primary, #2563eb);
      background: var(--color-primary, #2563eb);
      color: #ffffff;
    }

    .action-button.primary:hover:not(:disabled) {
      background: var(--color-primary-hover, #1d4ed8);
    }

    .action-button.danger {
      border-color: var(--color-danger, #c0392b);
      background: var(--color-danger, #c0392b);
      color: #ffffff;
    }

    .action-button.danger:hover:not(:disabled) {
      background: var(--color-danger-hover, #a93226);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: default;
    }

    .action-button:focus-visible,
    .close-button:focus-visible {
      outline: 2px solid var(--color-primary, #2563eb);
      outline-offset: 2px;
    }
  `
}
