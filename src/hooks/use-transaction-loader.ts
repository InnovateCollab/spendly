/**
 * Hook for loading transactions from database with error handling
 * Shared by Timeline and Overview screens
 * 
 * When filterMonth is provided: returns grouped transactions (DailyTransactions[])
 * When filterMonth is not provided: returns flat transactions (TransactionUI[])
 */

import { useState, useCallback, useEffect } from 'react';
import { database } from '@/database';
import { TransactionUI, DailyTransactions } from '@/schemas/transaction';

export function useTransactionLoader(filterMonth?: Date) {
    const [transactions, setTransactions] = useState<TransactionUI[] | DailyTransactions[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTransactions = useCallback(async (month?: Date) => {
        try {
            let dbTransactions: TransactionUI[] | DailyTransactions[];

            if (month) {
                // Fetch grouped transactions for the specific month from database
                const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
                const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
                dbTransactions = await database.getGroupedTransactionsByDateRange(startDate, endDate);
            } else {
                // Fetch all flat transactions
                dbTransactions = await database.getTransactionsWithCategories();
            }

            setTransactions(dbTransactions);
            setLoading(false);
        } catch (error) {
            console.log('Failed to load transactions:', error);
            setLoading(false);

            // Retry if database not ready
            if (error instanceof Error && (error.message.includes('not connected') || error.message.includes('not initialized'))) {
                setTimeout(() => loadTransactions(month), 1000);
            }
        }
    }, []);

    // Load on mount, or when filterMonth changes
    useEffect(() => {
        loadTransactions(filterMonth);
    }, [loadTransactions, filterMonth]);

    return { transactions, loading, loadTransactions };
}
