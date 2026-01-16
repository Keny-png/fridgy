/**
 * Sheets Service
 * Handles interactions with Google Sheets API
 */
import { v4 as uuidv4 } from 'uuid';
import { type InventoryItem, type StorageLocation } from '../types';

const SPREADSHEET_TITLE = 'Fridgy Database';
const INVENTORY_SHEET_TITLE = 'Inventory';

// Headers for the sheets
const INVENTORY_HEADERS = [
    'ID', 'Name', 'Quantity', 'Unit', 'Category', 'Location', 'ExpiryDate', 'AddedDate', 'Status', 'ImageID', 'Note'
];

export class SheetsService {
    private spreadsheetId: string | null = null;

    constructor() {
        // Try to recover ID from localStorage
        this.spreadsheetId = localStorage.getItem('fridgy_spreadsheet_id');
    }

    /**
     * Initializes the database.
     * Checks if we have an ID, if not searches for the file.
     * If not found, creates a new one.
     */
    async ensureDatabase(): Promise<string> {
        if (this.spreadsheetId) return this.spreadsheetId;

        // Search for existing file
        const searchRes = await window.gapi.client.drive.files.list({
            q: `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
            fields: 'files(id, name)',
        });

        if (searchRes.result.files && searchRes.result.files.length > 0) {
            this.spreadsheetId = searchRes.result.files[0].id;
            localStorage.setItem('fridgy_spreadsheet_id', this.spreadsheetId!);
            return this.spreadsheetId!;
        }

        // Create new
        const createRes = await window.gapi.client.sheets.spreadsheets.create({
            resource: {
                properties: { title: SPREADSHEET_TITLE },
                sheets: [
                    { properties: { title: INVENTORY_SHEET_TITLE } }
                ]
            }
        });

        this.spreadsheetId = createRes.result.spreadsheetId;
        localStorage.setItem('fridgy_spreadsheet_id', this.spreadsheetId!);

        // Initialize headers
        await this.initHeaders(this.spreadsheetId!);

        return this.spreadsheetId!;
    }

    private async initHeaders(spreadsheetId: string) {
        await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${INVENTORY_SHEET_TITLE}!A1:K1`,
            valueInputOption: 'RAW',
            resource: {
                values: [INVENTORY_HEADERS]
            }
        });
    }

    /**
     * Reads all active inventory items
     */
    async getInventory(): Promise<InventoryItem[]> {
        if (!this.spreadsheetId) await this.ensureDatabase();

        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${INVENTORY_SHEET_TITLE}!A2:K`, // Read from row 2
        });

        const rows = response.result.values;
        if (!rows || rows.length === 0) return [];

        return rows.map((row: any[]) => ({
            id: row[0],
            name: row[1],
            quantity: Number(row[2]),
            unit: row[3],
            category: row[4],
            location: row[5] as StorageLocation,
            expiryDate: row[6],
            addedDate: row[7],
            status: row[8],
            imageId: row[9],
            note: row[10]
        })).filter((item: InventoryItem) => item.status === 'active');
    }

    /**
     * Adds a new item
     */
    async addItem(item: Omit<InventoryItem, 'id' | 'status' | 'addedDate'>): Promise<InventoryItem> {
        if (!this.spreadsheetId) await this.ensureDatabase();

        const newItem: InventoryItem = {
            ...item,
            id: uuidv4(),
            status: 'active',
            addedDate: new Date().toISOString(),
        };

        const row = [
            newItem.id, newItem.name, newItem.quantity, newItem.unit || '', newItem.category,
            newItem.location, newItem.expiryDate, newItem.addedDate, newItem.status,
            newItem.imageId || '', newItem.note || ''
        ];

        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${INVENTORY_SHEET_TITLE}!A1`, // Append to end of sheet
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row]
            }
        });

        return newItem;
    }

    /**
     * Updates item status (recycle/waste)
     */
    async updateItemStatus(itemId: string, status: 'consumed' | 'wasted', reason?: string): Promise<void> {
        if (!this.spreadsheetId) await this.ensureDatabase();

        // 1. Find the row index (inefficient but works for small family lists)
        const inventory = await this.getInventoryAllRaw();
        const rowIndex = inventory.findIndex(row => row[0] === itemId);

        if (rowIndex === -1) throw new Error('Item not found');

        const rangeRow = rowIndex + 2; // +2 because 1-based and header is row 1

        // Update Status column (Index 8 -> Column I)
        await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${INVENTORY_SHEET_TITLE}!I${rangeRow}`,
            valueInputOption: 'RAW',
            resource: { values: [[status]] }
        });

        // Log to History
        await this.logHistory({
            id: uuidv4(),
            itemId,
            itemName: inventory[rowIndex][1], // Name
            date: new Date().toISOString(), // Use local time or ISO
            quantity: Number(inventory[rowIndex][2]),
            action: status,
            reason: reason || ''
        });
    }

    private async getInventoryAllRaw(): Promise<any[]> {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${INVENTORY_SHEET_TITLE}!A2:K`,
        });
        return response.result.values || [];
    }

    private async logHistory(log: any) {
        // Ensure History sheet exists
        try {
            await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `History!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[log.date, log.itemName, log.quantity, log.action, log.reason]]
                }
            });
        } catch (e) {
            console.warn('History log might have failed if sheet missing');
        }
    }

    async getHistory(): Promise<any[]> {
        if (!this.spreadsheetId) await this.ensureDatabase();
        try {
            const response = await window.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `History!A1:E`,
            });
            const rows = response.result.values;
            if (!rows || rows.length < 1) return [];

            return rows.map((row: any[]) => ({
                date: row[0],
                itemName: row[1],
                quantity: Number(row[2]),
                action: row[3],
                reason: row[4]
            }));
        } catch (e) {
            return [];
        }
    }
}

export const sheetsService = new SheetsService();
