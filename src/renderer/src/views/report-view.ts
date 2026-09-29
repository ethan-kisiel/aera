import { LitElement, TemplateResult, css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Entry } from '../../../types/shared-types'

export type ReportNodeType = 'category' | 'subcategory' | 'itemization'

export interface ReportNode {
  type: ReportNodeType
  label: string
  amount: number
  children: ReportNode[]
}

export interface ReportMetadata {
  title: string
  period?: string
  generatedAt?: string
}

@customElement('report-view')
export class ReportView extends LitElement {
  @property({ attribute: false })
  public metadata: ReportMetadata = {
    title: 'Expense Report'
  }

  @property({ attribute: false })
  public entries: Entry[] = []

  @property()
  public currency = 'USD'

  @property({ type: Boolean })
  public showPrintButton = true

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      color: #1f2937;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        sans-serif;
      font-size: 13px;
      background: #f4f5f6;
    } /* * Toolbar * * Remains fixed while the report scrolls. */
    .toolbar {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e5e9;
      background: #ffffff;
    }
    .title {
      margin: 0;
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }
    .metadata {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 3px;
      color: #6b7280;
      font-size: 12px;
    }
    .print-button {
      height: 30px;
      padding: 0 12px;
      border: 1px solid #cfd4da;
      border-radius: 4px;
      background: #ffffff;
      color: #374151;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .print-button:hover {
      background: #f8f9fa;
      border-color: #b9bec5;
    }
    .print-button:active {
      background: #f1f3f5;
    } /* * Scrolling viewport * * This is the only element that scrolls. */
    .document-container {
      display: block;
      flex: 1 1 auto;
      min-height: 0;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 24px;
      background: #f4f5f6;
      scrollbar-width: thin;
      scrollbar-color: #c7cbd1 transparent;
    }
    .document-container::-webkit-scrollbar {
      width: 8px;
    }
    .document-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .document-container::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: #c7cbd1;
    }
    .document-container::-webkit-scrollbar-thumb:hover {
      background: #adb2b9;
    } /* * Continuous paper * * The document is NOT a fixed-height page. * * It starts at Letter-page height but grows naturally * with the contents of the report. */
    .document {
      width: 100%;
      max-width: 8.5in;
      min-height: 11in;
      box-sizing: border-box;
      margin: 0 auto;
      padding: 0.6in 0.65in;
      background: #ffffff;
      box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
    } /* * Document header */
    .document-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 2px solid #1f2937;
    }
    .document-title {
      margin: 0;
      color: #111827;
      font-size: 20px;
      font-weight: 600;
    }
    .document-period {
      margin-top: 4px;
      color: #6b7280;
      font-size: 12px;
    }
    .generated {
      color: #6b7280;
      font-size: 10px;
      text-align: right;
    } /* * Report */
    .report {
      margin-top: 18px;
    } /* * Report nodes */
    .node {
      break-inside: avoid;
    }
    .node-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
      min-height: 28px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e7eb;
    }
    .node-label {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .node-amount {
      padding-left: 24px;
      font-variant-numeric: tabular-nums;
      text-align: right;
      white-space: nowrap;
    } /* * Category */
    .node-category > .node-header {
      min-height: 32px;
      margin-top: 14px;
      padding: 5px 0;
      border-bottom: 1px solid #1f2937;
      color: #111827;
      font-size: 14px;
      font-weight: 600;
    }
    .node-category:first-child > .node-header {
      margin-top: 0;
    } /* * Subcategory */
    .node-subcategory > .node-header {
      padding: 4px 0 4px 12px;
      border-bottom: 1px dotted #9ca3af;
      color: #374151;
      font-weight: 500;
    } /* * Itemization */
    .node-itemization > .node-header {
      padding: 4px 0 4px 28px;
      color: #4b5563;
    } /* * Empty state */
    .empty {
      padding: 48px 16px;
      color: #9ca3af;
      text-align: center;
    } /* * Grand total */
    .grand-total {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      margin-top: 24px;
      padding-top: 10px;
      border-top: 2px solid #1f2937;
      color: #111827;
      font-size: 14px;
      font-weight: 600;
    }
    .grand-total-amount {
      font-variant-numeric: tabular-nums;
      text-align: right;
    } /* * Printing * * The screen viewport disappears during printing. * * The document becomes normal flowing content and the * browser handles pagination automatically. */
    @media print {
      @page {
        size: Letter;
        margin: 0.5in;
      }

      :host {
        display: block;

        width: auto;
        height: auto;
        min-height: 0;

        overflow: visible;

        background: #ffffff;
      }

      .toolbar {
        display: none;
      }

      .document-container {
        display: block;

        width: auto;
        height: auto;
        min-height: 0;

        padding: 0;

        overflow: visible;

        background: #ffffff;
      }

      .document {
        display: block;

        width: auto;
        max-width: none;

        height: auto;
        min-height: 0;

        margin: 0;
        padding: 0;

        overflow: visible;

        background: #ffffff;

        box-shadow: none;
      }

      .document-header {
        break-inside: avoid;
      }

      .report {
        margin-top: 14px;
      }

      .node-header {
        break-inside: avoid;
      }

      .node-category > .node-header,
      .node-subcategory > .node-header {
        break-after: avoid;
      }

      .grand-total {
        break-inside: avoid;
      }
    }
  `

  protected render(): TemplateResult {
    const nodes = this._buildNodes(this.entries)
    const total = this._calculateTotal(nodes)

    return html`
      ${
        this.showPrintButton
          ? html`
              <div class="toolbar">
                <div>
                  <h2 class="title">${this.metadata.title}</h2>

                  ${
                    this.metadata.period
                      ? html`
                          <div class="metadata">
                            <span>${this.metadata.period}</span>
                          </div>
                        `
                      : nothing
                  }
                </div>

                <button class="print-button" type="button" @click=${this._print}>Print</button>
              </div>
            `
          : nothing
      }

      <div class="document-container">
        <section class="document">
          <header class="document-header">
            <div>
              <h1 class="document-title">${this.metadata.title}</h1>

              ${
                this.metadata.period
                  ? html` <div class="document-period">${this.metadata.period}</div> `
                  : nothing
              }
            </div>

            ${
              this.metadata.generatedAt
                ? html`
                    <div class="generated">
                      Generated<br />
                      ${this.metadata.generatedAt}
                    </div>
                  `
                : nothing
            }
          </header>

          <section class="report">
            ${
              nodes.length === 0
                ? html` <div class="empty">No report data</div> `
                : nodes.map((node) => this._renderNode(node))
            }
            ${
              nodes.length > 0
                ? html`
                    <div class="grand-total">
                      <span>Grand Total</span>

                      <span class="grand-total-amount"> ${this._formatCurrency(total)} </span>
                    </div>
                  `
                : nothing
            }
          </section>
        </section>
      </div>
    `
  }

  private _buildNodes(entries: Entry[]): ReportNode[] {
    const categoryMap = new Map<string, Map<string, Map<string, number>>>()

    for (const entry of entries) {
      const category = this._normalizeLabel(entry.category)
      const subcategory = this._normalizeLabel(entry.subcategory)
      const itemization = this._normalizeLabel(entry.itemization)

      let subcategoryMap = categoryMap.get(category)

      if (!subcategoryMap) {
        subcategoryMap = new Map()
        categoryMap.set(category, subcategoryMap)
      }

      let itemizationMap = subcategoryMap.get(subcategory)

      if (!itemizationMap) {
        itemizationMap = new Map()
        subcategoryMap.set(subcategory, itemizationMap)
      }

      const currentAmount = itemizationMap.get(itemization) ?? 0

      itemizationMap.set(itemization, currentAmount + entry.amount)
    }

    const nodes: ReportNode[] = []

    for (const [categoryName, subcategoryMap] of categoryMap) {
      const categoryNode: ReportNode = {
        type: 'category',
        label: categoryName,
        amount: 0,
        children: []
      }

      for (const [subcategoryName, itemizationMap] of subcategoryMap) {
        const subcategoryNode: ReportNode = {
          type: 'subcategory',
          label: subcategoryName,
          amount: 0,
          children: []
        }

        for (const [itemizationName, amount] of itemizationMap) {
          subcategoryNode.children.push({
            type: 'itemization',
            label: itemizationName,
            amount,
            children: []
          })

          subcategoryNode.amount += amount
        }

        categoryNode.children.push(subcategoryNode)
        categoryNode.amount += subcategoryNode.amount
      }

      nodes.push(categoryNode)
    }

    return nodes
  }

  private _renderNode(node: ReportNode): TemplateResult {
    return html`
      <div class="node node-${node.type}">
        <div class="node-header">
          <span class="node-label"> ${node.label} </span>

          <span class="node-amount"> ${this._formatCurrency(node.amount)} </span>
        </div>

        ${
          node.children.length > 0
            ? html`
                <div class="node-children">
                  ${node.children.map((child) => this._renderNode(child))}
                </div>
              `
            : nothing
        }
      </div>
    `
  }

  private _calculateTotal(nodes: ReportNode[]): number {
    return nodes.reduce((total, node) => total + node.amount, 0)
  }

  private _normalizeLabel(value: string): string {
    const normalized = value.trim()

    return normalized.length > 0 ? normalized : 'Uncategorized'
  }

  private _formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(value / 100)
  }

  private _print = (): void => {
    window.print()
  }
}
