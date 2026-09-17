import { LitElement, html, css, TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './views/entry-input-ribbon'
import './views/ledger-view'
import './components/app-modal'
import './components/autocomplete-input'
import { Entry } from '../../types/shared-types'
import { ModalAction } from './components/app-modal'

@customElement('aera-app')
export class AeraApp extends LitElement {
  @state()
  private _rows: Entry[] = []

  @state()
  private _years: string[] = []

  @state()
  private _isYearModalShown = false

  @state()
  private _isDeleteModalShown = false

  @state()
  private _selectedYear = `${new Date().getFullYear()}`

  @state()
  private _isEntryRibbonShown = true

  @state()
  private _checkbooks: string[] = []

  @state()
  private _categories: string[] = []

  @state()
  private _subcategories: string[] = []

  @state()
  private _itemizations: string[] = []

  @state()
  private _newYear: number | null = null

  @state()
  private _deletedEntry: Entry | null = null

  @state()
  private _selectedEntry: Omit<Entry, 'amount'> & { amount: number | null } = {
    id: -1,
    date: '',
    checkbook: '',
    check_number: '',
    amount: null,
    category: '',
    subcategory: '',
    itemization: '',
    notes: ''
  }

  private async updateDropdownSets(): Promise<void> {
    this._checkbooks = (await window.ledgerApi.getColumnUniques('checkbook')) ?? []
    this._categories = (await window.ledgerApi.getColumnUniques('category')) ?? []
    this._subcategories = (await window.ledgerApi.getColumnUniques('subcategory')) ?? []
    this._itemizations = (await window.ledgerApi.getColumnUniques('itemization')) ?? []
  }

  private async refreshTableData(): Promise<void> {
    this._rows = await window.ledgerApi.search(
      { year: this._selectedYear },
      { column: 'date', descending: true }
    )
  }

  private async refreshYears(): Promise<void> {
    this._years = await window.ledgerApi.getUniqueYears()
    if (this._years.length == 0) {
      this._years = [this._selectedYear]
    }
    this._selectedYear =
      this._years.length > 0 ? this._years[this._years.length - 1] : this._selectedYear
  }

  private async doInitialSetup(): Promise<void> {
    // setup years
    await this.refreshYears()
    // setup rows
    await this.refreshTableData()
    // update input dropdowns
    await this.updateDropdownSets()
  }

  connectedCallback(): void {
    super.connectedCallback()
    void this.doInitialSetup()
  }

  protected override render(): TemplateResult {
    return html`
      <div class="container">
        <ledger-view
          .rows=${this._rows}
          .years=${this._years}
          .selectedYear=${this._selectedYear}
          @year-change=${this._handleYearChange}
          @year-add=${this._handleYearAdd}
          @row-focus=${this._handleRowFocus}
          @row-delete=${this._handleRowDelete}
        ></ledger-view>
        ${
          this._isEntryRibbonShown
            ? html`<entry-input-ribbon
                @save=${this._handleAddEntry}
                @close=${this._clearInput}
                year=${Number.parseInt(this._selectedYear)}
                .entry=${this._selectedEntry}
                .checkbooks=${this._checkbooks}
                .categories=${this._categories}
                .subcategories=${this._subcategories}
                .itemizations=${this._itemizations}
              >
              </entry-input-ribbon>`
            : null
        }
        ${
          this._isYearModalShown
            ? html`
                <app-modal
                  .open=${this._isYearModalShown}
                  title="New year"
                  .actions=${[
                    {
                      id: 'cancel',
                      label: 'Cancel'
                    } as ModalAction,
                    {
                      id: 'add',
                      label: 'Add year',
                      variant: 'primary'
                    } as ModalAction
                  ]}
                  @modal-action=${(event: CustomEvent<{ action: string }>) => {
                    if (event.detail.action == 'cancel') {
                      this._newYear = null
                      this._isYearModalShown = false
                    }
                    if (event.detail.action == 'add') {
                      if (this._newYear && this._newYear > 1800 && this._newYear < 4000) {
                        if (this._years?.includes(`${this._newYear}`)) {
                          return
                        }

                        this._years.push(`${this._newYear}`)
                        this._selectedYear = `${this._newYear}`

                        this.refreshTableData()
                        this._newYear = null
                        this._isYearModalShown = false
                      }
                    }
                  }}
                  @modal-close=${() => (this._isYearModalShown = false)}
                >
                  <div class="year-form">
                    <label>
                      <span>Year</span>
                      <autocomplete-input
                        .invalid=${
                          !this._newYear ||
                          this._newYear < 1800 ||
                          this._newYear > 4000 ||
                          this._years?.includes(`${this._newYear}`)
                        }
                        @input=${(event) => {
                          const value = (event.currentTarget as HTMLInputElement).value
                          this._newYear = Number.parseInt(value)
                        }}
                      >
                      </autocomplete-input>
                    </label>
                  </div>
                </app-modal>
              `
            : null
        }
        ${
          this._isDeleteModalShown
            ? html`
                <app-modal
                  .open=${this._isDeleteModalShown}
                  title="Delete entry"
                  message="Are you sure you want to delete this entry?"
                  .actions=${[
                    {
                      id: 'cancel',
                      label: 'Cancel'
                    },
                    {
                      id: 'delete',
                      label: 'Delete',
                      variant: 'danger'
                    }
                  ]}
                  @modal-action=${async (event: CustomEvent<{ action: string }>) => {
                    if (event.detail.action == 'cancel') {
                      this._isDeleteModalShown = false
                      this._deletedEntry = null
                    }
                    if (event.detail.action == 'delete') {
                      if (this._deletedEntry) {
                        const deleteResult = await window.ledgerApi.deleteEntry(
                          this._deletedEntry.id
                        )
                        if (!deleteResult) {
                          this._isDeleteModalShown = false
                          this._deletedEntry = null
                          return
                        }

                        this._deletedEntry = null
                        await this.refreshTableData()
                        this._isDeleteModalShown = false
                      }
                    }
                  }}
                  @modal-close=${() => {
                    this._isDeleteModalShown = false
                    this._deletedEntry = null
                  }}
                ></app-modal>
              `
            : null
        }
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      box-sizing: border-box;
    }

    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column; /* Keeps child elements neatly stacked */
      overflow: hidden;
    }
  `

  private async _handleAddEntry(event: CustomEvent<{ entry: Entry }>): Promise<void> {
    if (event.detail.entry.id < 1) {
      const createResult = await window.ledgerApi.createEntry(event.detail.entry)
      if (createResult) {
        this.refreshTableData()
        this.updateDropdownSets()
        this._clearInput()
      }
    }

    const updateResult = await window.ledgerApi.updateEntry(event.detail.entry)
    if (updateResult) {
      this.refreshTableData()
      this.updateDropdownSets()
      this._clearInput()
    }
  }

  private async _handleYearChange(event: CustomEvent<{ year: string }>): Promise<void> {
    this._selectedYear = event.detail.year
    this._rows = await window.ledgerApi.search(
      {
        year: this._selectedYear
      },
      { column: 'date', descending: false }
    )
  }

  private _handleYearAdd(): void {
    // Create a new year here.
    this._isYearModalShown = true
  }

  private _handleRowFocus(event: CustomEvent<{ row: Entry }>): void {
    // Open/edit the selected entry.
    this._selectedEntry = event.detail.row
  }

  private _handleRowDelete(event: CustomEvent<{ row: Entry }>): void {
    this._deletedEntry = event.detail.row
    this._isDeleteModalShown = true
  }

  private _clearInput(): void {
    this._selectedEntry = {
      id: -1,
      date: '',
      checkbook: '',
      check_number: '',
      amount: null,
      category: '',
      subcategory: '',
      itemization: '',
      notes: ''
    }
  }
}
