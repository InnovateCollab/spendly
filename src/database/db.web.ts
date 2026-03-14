/**
 * Mock Database for Web Platform
 * Avoids loading expo-sqlite WASM module on web
 * Uses data from TRANSACTION_SECTIONS
 */

import { TRANSACTION_SECTIONS } from '@/data/transactions';
import { Transaction, TransactionUI, DailyTransactions } from '@/schemas/transaction';

class MockDatabase {
    private isInitialized = false;

    // ============================================
    // INITIALIZATION & CONNECTION
    // ============================================

    async init() {
        // Mock initialization
        this.isInitialized = true;
        console.log('✓ Mock database initialized (web)');
    }

    async close() {
        this.isInitialized = false;
        console.log('✓ Mock database connection closed');
    }

    // ============================================
    // CRUD: CREATE
    // ============================================

    async insertTransaction(transaction: Omit<Transaction, 'id'>) {
        return Math.random() * 10000;
    }

    async insertCategory() {
        // Mock: No-op for web
        return 0;
    }

    // ============================================
    // CRUD: READ
    // ============================================

    /**
     * Get all transactions ordered by date (newest first)
     * Used to check if database has seed data
     */
    async getTransactions(): Promise<Transaction[]> {
        return TRANSACTION_SECTIONS.reduce((acc, section) => {
            return [...acc, ...section.transactions.map(tx => ({
                id: tx.id,
                categoryId: tx.category.id,
                amount: tx.amount,
                date: tx.date,
                note: tx.note,
                labels: tx.labels,
            }))];
        }, [] as Transaction[]);
    }

    /**
     * Get all transactions with category data (for UI display)
     */
    async getTransactionsWithCategories(): Promise<TransactionUI[]> {
        return TRANSACTION_SECTIONS.reduce((acc, section) => {
            return [...acc, ...section.transactions];
        }, [] as TransactionUI[]);
    }

    /**
     * Get transactions grouped by date for a date range with daily totals
     * Returns transactions organized by day with pre-calculated daily totals
     */
    async getGroupedTransactionsByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<DailyTransactions[]> {
        const all = await this.getTransactionsWithCategories();
        const filtered = all.filter(t => t.date >= startDate && t.date <= endDate);

        // Group by date
        const groups = new Map<string, TransactionUI[]>();
        for (const tx of filtered) {
            const dateKey = tx.date.toISOString().split('T')[0];
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey)!.push(tx);
        }

        // Convert to DailyTransactions array
        return Array.from(groups.entries())
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([dateStr, txs]) => ({
                date: new Date(dateStr),
                totalAmount: txs.reduce((sum, t) => sum + t.amount, 0),
                transactions: txs,
            }));
    }

    // ============================================
    // CRUD: UPDATE
    // ============================================

    async updateTransaction(id: number, transaction: Partial<Transaction>) {
        // Mock: No-op for web
    }

    // ============================================
    // CRUD: DELETE
    // ============================================

    async deleteTransaction(id: number) {
        // Mock: No-op for web
    }

    /**
     * Clear all transactions (for testing)
     */
    async clearTransactions() {
        // Mock: No-op for web
    }
}

export const database = new MockDatabase();
