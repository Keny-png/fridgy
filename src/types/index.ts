export type StorageLocation = '冷蔵' | '冷凍' | '常温';

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit?: string;
    category: string;
    location: StorageLocation;
    expiryDate: string; // ISO Date string
    addedDate: string; // ISO Date string
    status: 'active' | 'consumed' | 'wasted';
    imageId?: string;
    note?: string;
}

export interface ConsumptionLog {
    id: string;
    itemId: string;
    itemName: string;
    date: string;
    quantity: number;
    action: 'consumed' | 'wasted';
    reason?: 'expired' | 'damaged' | 'other' | 'none';
}

export type SortOption = 'expiry' | 'added' | 'name' | 'location';
export type FilterOption = 'all' | 'expired' | StorageLocation;
