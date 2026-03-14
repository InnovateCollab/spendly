/**
 * Hook for loading transactions from database with error handling
 * Shared by Timeline and Overview screens
 */

import { useState, useCallback, useEffect } from 'react';
import { database } from '@/database';
import { TransactionUI } from '@/schemas/transaction';

export function useTransactionLoader() {
    const [transactions, setTransactions] = useState<TransactionUI[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTransactions = useCallback(async () => {
        try {
            const dbTransactions = await database.getTransactionsWithCategories();
            setTransactions(dbTransactions);
            setLoading(false);
        } catch (error) {
            console.log('Failed to load transactions:', error);
            setLoading(false);

            // Retry if database not ready
            if (error instanceof Error && error.message.includes('not connected')) {
                setTimeout(() => loadTransactions(), 1000);
            }
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return { transactions, loading, loadTransactions };
}
