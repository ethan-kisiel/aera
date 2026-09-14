import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './views/entry-input-ribbon'
import './views/ledger-view'
import { Entry } from '../../types/shared-types';

@customElement('aera-app')
export class AeraApp extends LitElement {
   @state()
    private _rows: Entry[] = [];

    @state()
    private _years = ['2026', '2025', '2024'];

    @state()
    private _selectedYear = '2026';

    @state()
    private _isEntryRibbonShown = true;


    async connectedCallback() {
      super.connectedCallback();
      const result = await window.ledgerApi.search({ year: this._selectedYear }, { column: 'date', descending: true})
      console.log(result)
      this._rows = await window.ledgerApi.search({ year: this._selectedYear }, { column: 'date', descending: true})
    }

    protected override render() {
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
            ${ this._isEntryRibbonShown ? 
              html`<entry-input-ribbon @save=${this._handleAddEntry} year=${Number.parseInt(this._selectedYear)}>
              </entry-input-ribbon>` : null}
          </div>
        `;
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
    `;

    private async _handleAddEntry(event: CustomEvent<{ entry: Entry}>) {
      console.log(`submitted entry: ${event.detail.entry.date}`);
      const createResult = await window.ledgerApi.createEntry(event.detail.entry);
      if (createResult) {
        this._rows = await window.ledgerApi.search({
          year: this._selectedYear,
        }, {column: 'date', descending: false});
      }
    }

    private async _handleYearChange(
        event: CustomEvent<{ year: string }>,
    ) {
        this._selectedYear = event.detail.year;
        this._rows = await window.ledgerApi.search({
          year: this._selectedYear,
        }, {column: 'date', descending: false});
    }

    private _handleYearAdd() {
        // Create a new year here.
    }

    private _handleRowFocus(
        _: CustomEvent,
    ) {
        // Open/edit the selected entry.
    }

    private _handleRowDelete(
        _: CustomEvent,
    ) {
        // Handle deletion.
    }
}