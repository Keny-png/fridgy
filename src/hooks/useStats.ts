import { useState, useEffect } from 'react';
import { sheetsService } from '../lib/sheets';
import { useAuth } from '../contexts/AuthContext';

export interface HistoryItem {
    date: string;
    itemName: string;
    quantity: number;
    action: 'consumed' | 'wasted';
    reason?: string;
}

export const useStats = () => {
    const { isAuthenticated } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated) return;
            setIsLoading(true);
            try {
                const data = await sheetsService.getHistory();
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [isAuthenticated]);

    return { history, isLoading };
};
