import { useState, useEffect, useCallback } from 'react';
import { sheetsService } from '../lib/sheets';
import { type InventoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useInventory = () => {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoading(true);
            const data = await sheetsService.getInventory();
            setItems(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load inventory. Please checking your connection.');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchItems();
        }
    }, [isAuthenticated, fetchItems]);

    const addItem = async (item: Omit<InventoryItem, 'id' | 'status' | 'addedDate'>) => {
        try {
            const newItem = await sheetsService.addItem(item);
            setItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err: any) {
            console.error(err);
            throw new Error('Failed to add item');
        }
    };

    const updateStatus = async (id: string, status: 'consumed' | 'wasted', reason?: string) => {
        try {
            // Optimistic update
            setItems(prev => prev.filter(item => item.id !== id));
            await sheetsService.updateItemStatus(id, status, reason);
        } catch (err: any) {
            console.error(err);
            // Revert if failed (would need more complex state, skipping for MVP)
            fetchItems();
            throw new Error('Failed to update status');
        }
    };

    return {
        items,
        isLoading,
        error,
        refresh: fetchItems,
        addItem,
        updateStatus
    };
};
