import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface TableColumn<T extends object> {
    /**
     * Unique identifier for the column.
     */
    key: string;

    /**
     * Text displayed in the header.
     */
    header: string;

    /**
     * Gets the value displayed in the cell.
     */
    getValue: (row: T) => unknown;

    /**
     * Optional column width.
     */
    width?: string;

    /**
     * Optional formatter for the displayed value.
     */
    formatValue?: (value: unknown, row: T) => string;
}

export interface TableFocusEvent<T extends object> {
    row: T;
}

export interface TableDeleteEvent<T extends object> {
    row: T;
}

@customElement('simple-table')
export class SimpleTable<
    T extends object = Record<string, unknown>,
> extends LitElement {
    /**
     * Rows displayed by the table.
     */
    @property({ attribute: false })
    public rows: T[] = [];

    /**
     * Columns displayed by the table.
     */
    @property({ attribute: false })
    public columns: TableColumn<T>[] = [];

    /**
     * Text displayed when there are no rows.
     */
    @property({ type: String })
    public emptyText = 'No entries';

    /**
     * Rows currently marked for deletion.
     *
     * Object identity is intentionally used here. The table does
     * not need to know anything about the user's row model or IDs.
     */
    @state()
    private _deletedRows = new WeakSet<object>();

    public static styles = css`
        :host {
            display: block;

            width: 100%;

            color: #1f2937;

            font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            font-size: 13px;
        }

        .table-container {
            width: 100%;

            overflow-x: auto;

            border: 1px solid #e2e5e9;
            border-radius: 8px;

            background: #ffffff;
        }

        table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        thead {
            background: #f8f9fa;
        }

        th {
            height: 36px;

            padding: 0 10px;

            border-bottom: 1px solid #e2e5e9;

            color: #6b7280;

            font-size: 11px;
            font-weight: 600;

            text-align: left;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        td {
            height: 38px;

            padding: 0 10px;

            border-bottom: 1px solid #edf0f2;

            overflow: hidden;

            white-space: nowrap;
            text-overflow: ellipsis;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tbody tr:hover {
            background: #fafbfc;
        }

        /*
         * Soft-deleted rows.
         */
        tbody tr.deleted {
            color: #9ca3af;
            text-decoration: line-through;
        }

        /*
         * Actions column.
         */
        .actions {
            width: 84px;

            padding: 0 6px;

            text-align: right;

            white-space: nowrap;
        }

        .action-button {
            width: 28px;
            height: 28px;

            padding: 0;

            border: none;
            border-radius: 5px;

            background: transparent;

            color: #9ca3af;

            font-family: inherit;
            font-size: 14px;

            cursor: pointer;
        }

        .action-button:hover {
            background: #f1f5f9;

            color: #374151;
        }

        .delete-button:hover {
            background: #fef2f2;

            color: #ef4444;
        }

        .empty {
            padding: 32px 16px;

            color: #9ca3af;

            text-align: center;

            text-decoration: none;
        }
    `;

    protected render() {
        return html`
            <div class="table-container">
                <table>
                    <colgroup>
                        ${this.columns.map(
                            (column) => html`
                                <col
                                    style=${column.width
                                        ? `width: ${column.width}`
                                        : ''}
                                />
                            `,
                        )}

                        <col style="width: 84px" />
                    </colgroup>

                    <thead>
                        <tr>
                            ${this.columns.map(
                                (column) => html`
                                    <th>
                                        ${column.header}
                                    </th>
                                `,
                            )}

                            <th class="actions"></th>
                        </tr>
                    </thead>

                    <tbody>
                        ${this.rows.length === 0
                            ? this._renderEmpty()
                            : this.rows.map(
                                  (row) =>
                                      this._renderRow(row),
                              )}
                    </tbody>
                </table>
            </div>
        `;
    }

    private _renderRow(row: T) {
        const deleted = this._deletedRows.has(row);

        return html`
            <tr class=${deleted ? 'deleted' : ''}>
                ${this.columns.map(
                    (column) =>
                        this._renderCell(
                            row,
                            column,
                        ),
                )}

                <td class="actions">
                    <button
                        class="action-button"
                        type="button"
                        title="Focus row"
                        aria-label="Focus row"
                        @click=${() =>
                            this._focusRow(row)}
                    >
                        ⦿
                    </button>

                    <button
                        class="action-button delete-button"
                        type="button"
                        title="Mark for deletion"
                        aria-label="Mark row for deletion"
                        @click=${() =>
                            this._deleteRow(row)}
                    >
                        ×
                    </button>
                </td>
            </tr>
        `;
    }

    private _renderCell(
        row: T,
        column: TableColumn<T>,
    ) {
        const value = column.getValue(row);

        const displayValue =
            column.formatValue
                ? column.formatValue(
                      value,
                      row,
                  )
                : value == null
                  ? ''
                  : String(value);

        return html`
            <td>
                ${displayValue}
            </td>
        `;
    }

    private _renderEmpty() {
        return html`
            <tr>
                <td
                    class="empty"
                    colspan=${this.columns.length + 1}
                >
                    ${this.emptyText}
                </td>
            </tr>
        `;
    }

    private _focusRow(row: T): void {
        this.dispatchEvent(
            new CustomEvent<TableFocusEvent<T>>(
                'row-focus',
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        row,
                    },
                },
            ),
        );
    }

    private _deleteRow(row: T): void {
        if (this._deletedRows.has(row)) {
            return;
        }

        this._deletedRows.add(row);

        this.dispatchEvent(
            new CustomEvent<TableDeleteEvent<T>>(
                'row-delete',
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        row,
                    },
                },
            ),
        );

        this.requestUpdate();
    }

    /**
     * Removes the soft-delete state from a row.
     */
    public restoreRow(row: T): void {
        this._deletedRows.delete(row);
        this.requestUpdate();
    }

    /**
     * Returns whether a row has been marked for deletion.
     */
    public isDeleted(row: T): boolean {
        return this._deletedRows.has(row);
    }

    /**
     * Returns all rows currently marked for deletion.
     */
    public getDeletedRows(): T[] {
        return this.rows.filter((row) =>
            this._deletedRows.has(row),
        );
    }
}