/**
 * Mock Database for Web Platform
 * Avoids loading expo-sqlite WASM module on web
 * Uses data from TRANSACTION_SECTIONS
 */

import { TRANSACTION_SECTIONS } from '@/data/transactions';
import { Transaction, TransactionUI } from '@/schemas/transaction';

class MockDatabase {
    private isInitialized = false;

    async init() {
        // Mock initialization
        this.isInitialized = true;
        console.log('✓ Mock database initialized (web)');
    }

    async insertTransaction(transaction: Omit<Transaction, 'id'>) {
        return Math.random() * 10000;
    }

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

    async getTransactionsByDate(date: Date): Promise<Transaction[]> {
        const dateStr = date.toISOString().split('T')[0];
        return (await this.getTransactions()).filter(
            t => t.date.toISOString().split('T')[0] === dateStr
        );
    }

    async getTransactionsByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<Transaction[]> {
        return (await this.getTransactions()).filter(
            t => t.date >= startDate && t.date <= endDate
        );
    }

    async getTransaction(id: number): Promise<Transaction | null> {
        const transactions = await this.getTransactions();
        return transactions.find(t => t.id === id) || null;
    }

    async updateTransaction(id: number, transaction: Partial<Transaction>) {
        // Mock: No-op for web
    }

    async deleteTransaction(id: number) {
        // Mock: No-op for web
    }

    async getTransactionCountByCategory(categoryId: number): Promise<number> {
        const transactions = await this.getTransactions();
        return transactions.filter(t => t.categoryId === categoryId).length;
    }

    async getTotalByCategory(categoryId: number): Promise<number> {
        const transactions = await this.getTransactions();
        return transactions
            .filter(t => t.categoryId === categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    async clearTransactions() {
        // Mock: No-op for web
    }

    async getTransactionsWithCategories(): Promise<TransactionUI[]> {
        return TRANSACTION_SECTIONS.reduce((acc, section) => {
            return [...acc, ...section.transactions];
        }, [] as TransactionUI[]);
    }

    async getTransactionsByDateWithCategories(date: Date): Promise<TransactionUI[]> {
        const dateStr = date.toISOString().split('T')[0];
        const all = await this.getTransactionsWithCategories();
        return all.filter(
            t => t.date.toISOString().split('T')[0] === dateStr
        );
    }

    async getTransactionsByDateRangeWithCategories(
        startDate: Date,
        endDate: Date
    ): Promise<TransactionUI[]> {
        const all = await this.getTransactionsWithCategories();
        return all.filter(
            t => t.date >= startDate && t.date <= endDate
        );
    }

    async close() {
        this.isInitialized = false;
        console.log('✓ Mock database connection closed');
    }
}

export const database = new MockDatabase();
