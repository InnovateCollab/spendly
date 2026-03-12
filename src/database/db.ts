/**
 * SQLite Database Connection and Initialization
 * Handles database setup, migrations, and seeding
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';
import { CATEGORIES } from '@/constants/categories';
import { TRANSACTION_SECTIONS } from '@/data/transactions';
import { Transaction, TransactionUI } from '@/schemas/transaction';
import { Category } from '@/schemas/category';

const DATABASE_NAME = 'spendly.db';

export class Database {
    private db: SQLite.SQLiteDatabase | null = null;
    private isInitialized = false;

    async init() {
        if (this.isInitialized) {
            console.log('Database already initialized');
            return;
        }

        try {
            this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            console.log('✓ Database connection opened');

            await this.createTables();
            console.log('✓ Database tables created');

            const categoryIdMap = await this.seedCategories();
            console.log('✓ Categories seeded');

            await this.seedTransactions(categoryIdMap);
            console.log('✓ Transactions seeded');

            this.isInitialized = true;
            console.log('✓ Database initialized successfully');
        } catch (error) {
            console.error('✗ Database initialization failed:', error);
            throw error;
        }
    }

    private async createTables() {
        if (!this.db) throw new Error('Database not connected');

        const statements = DATABASE_SCHEMA.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await this.db.execAsync(statement);
        }
    }

    private async seedCategories(): Promise<Map<string, number>> {
        if (!this.db) throw new Error('Database not connected');

        const categoryIdMap = new Map<string, number>();

        for (const category of Object.values(CATEGORIES)) {
            try {
                const result = await this.db.runAsync(
                    `INSERT OR IGNORE INTO categories (name, icon_ios, icon_android, icon_web, color, type)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        category.name,
                        typeof category.icon === 'object' ? (category.icon.ios || '') : '',
                        typeof category.icon === 'object' ? (category.icon.android || '') : '',
                        typeof category.icon === 'object' ? (category.icon.web || '') : '',
                        category.color,
                        category.type,
                    ]
                );
                // Get the actual ID from database
                const row = await this.db.getFirstAsync<{ id: number }>(
                    `SELECT id FROM categories WHERE name = ?`,
                    [category.name]
                );
                if (row) {
                    categoryIdMap.set(category.name, row.id);
                }
            } catch (error) {
                console.error(`Failed to seed category ${category.name}:`, error);
            }
        }

        return categoryIdMap;
    }

    private async seedTransactions(categoryIdMap: Map<string, number>) {
        if (!this.db) throw new Error('Database not connected');

        for (const dailyTransactions of TRANSACTION_SECTIONS) {
            for (const transaction of dailyTransactions.transactions) {
                try {
                    const categoryId = categoryIdMap.get(transaction.category.name);
                    if (!categoryId) {
                        console.warn(`Category not found for transaction: ${transaction.category.name}`);
                        continue;
                    }

                    await this.db.runAsync(
                        `INSERT OR IGNORE INTO transactions (category_id, amount, date, note, labels)
           VALUES (?, ?, ?, ?, ?)`,
                        [
                            categoryId,
                            transaction.amount,
                            transaction.date instanceof Date
                                ? transaction.date.toISOString()
                                : transaction.date,
                            transaction.note || null,
                            transaction.labels ? JSON.stringify(transaction.labels) : null,
                        ]
                    );
                } catch (error) {
                    console.error(`Failed to seed transaction:`, error);
                }
            }
        }
    }

    /**
     * Insert a new transaction
     */
    async insertTransaction(transaction: Omit<Transaction, 'id'>) {
        if (!this.db) throw new Error('Database not connected');

        const result = await this.db.runAsync(
            `INSERT INTO transactions (category_id, amount, date, note, labels)
       VALUES (?, ?, ?, ?, ?)`,
            [
                transaction.categoryId,
                transaction.amount,
                transaction.date instanceof Date
                    ? transaction.date.toISOString()
                    : transaction.date,
                transaction.note || null,
                transaction.labels ? JSON.stringify(transaction.labels) : null,
            ]
        );

        return result.lastInsertRowId;
    }

    /**
     * Get all transactions ordered by date (newest first)
     */
    async getTransactions(): Promise<Transaction[]> {
        if (!this.db) throw new Error('Database not connected');

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions ORDER BY date DESC`
        );

        return rows.map(this.deserializeTransaction);
    }

    /**
     * Get transactions for a specific date
     */
    async getTransactionsByDate(date: Date): Promise<Transaction[]> {
        if (!this.db) throw new Error('Database not connected');

        const dateStr = date.toISOString().split('T')[0];

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions 
       WHERE DATE(date) = DATE(?) 
       ORDER BY date DESC`,
            [dateStr]
        );

        return rows.map(this.deserializeTransaction);
    }

    /**
     * Get transactions for a date range
     */
    async getTransactionsByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<Transaction[]> {
        if (!this.db) throw new Error('Database not connected');

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions 
       WHERE date >= ? AND date <= ? 
       ORDER BY date DESC`,
            [startDate.toISOString(), endDate.toISOString()]
        );

        return rows.map(this.deserializeTransaction);
    }

    /**
     * Get transaction by ID
     */
    async getTransaction(id: number): Promise<Transaction | null> {
        if (!this.db) throw new Error('Database not connected');

        const row = await this.db.getFirstAsync<any>(
            `SELECT * FROM transactions WHERE id = ?`,
            [id]
        );

        return row ? this.deserializeTransaction(row) : null;
    }

    /**
     * Update a transaction
     */
    async updateTransaction(id: number, transaction: Partial<Transaction>) {
        if (!this.db) throw new Error('Database not connected');

        const updates: string[] = [];
        const values: any[] = [];

        if (transaction.categoryId !== undefined) {
            updates.push('category_id = ?');
            values.push(transaction.categoryId);
        }
        if (transaction.amount !== undefined) {
            updates.push('amount = ?');
            values.push(transaction.amount);
        }
        if (transaction.date !== undefined) {
            updates.push('date = ?');
            values.push(
                transaction.date instanceof Date
                    ? transaction.date.toISOString()
                    : transaction.date
            );
        }
        if (transaction.note !== undefined) {
            updates.push('note = ?');
            values.push(transaction.note);
        }
        if (transaction.labels !== undefined) {
            updates.push('labels = ?');
            values.push(
                transaction.labels ? JSON.stringify(transaction.labels) : null
            );
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        if (updates.length === 1) return;

        await this.db.runAsync(
            `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    }

    /**
     * Delete a transaction
     */
    async deleteTransaction(id: number) {
        if (!this.db) throw new Error('Database not connected');

        await this.db.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    }

    /**
     * Get transaction count by category
     */
    async getTransactionCountByCategory(categoryId: number): Promise<number> {
        if (!this.db) throw new Error('Database not connected');

        const result = await this.db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM transactions WHERE category_id = ?`,
            [categoryId]
        );

        return result?.count || 0;
    }

    /**
     * Get total amount by category
     */
    async getTotalByCategory(categoryId: number): Promise<number> {
        if (!this.db) throw new Error('Database not connected');

        const result = await this.db.getFirstAsync<{ total: number }>(
            `SELECT SUM(amount) as total FROM transactions WHERE category_id = ?`,
            [categoryId]
        );

        return result?.total || 0;
    }

    /**
     * Clear all transactions (for testing)
     */
    async clearTransactions() {
        if (!this.db) throw new Error('Database not connected');

        await this.db.execAsync('DELETE FROM transactions');
    }

    /**
     * Get all transactions with category data (for UI display)
     */
    async getTransactionsWithCategories(): Promise<TransactionUI[]> {
        if (!this.db) throw new Error('Database not connected');

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions ORDER BY date DESC`
        );

        return rows.map(row => this.deserializeTransactionUI(row));
    }

    /**
     * Get transactions for a specific date with category data (for UI display)
     */
    async getTransactionsByDateWithCategories(date: Date): Promise<TransactionUI[]> {
        if (!this.db) throw new Error('Database not connected');

        const dateStr = date.toISOString().split('T')[0];

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions 
       WHERE DATE(date) = DATE(?) 
       ORDER BY date DESC`,
            [dateStr]
        );

        return rows.map(row => this.deserializeTransactionUI(row));
    }

    /**
     * Get transactions for a date range with category data (for UI display)
     */
    async getTransactionsByDateRangeWithCategories(
        startDate: Date,
        endDate: Date
    ): Promise<TransactionUI[]> {
        if (!this.db) throw new Error('Database not connected');

        const rows = await this.db.getAllAsync<any>(
            `SELECT * FROM transactions 
       WHERE date >= ? AND date <= ? 
       ORDER BY date DESC`,
            [startDate.toISOString(), endDate.toISOString()]
        );

        return rows.map(row => this.deserializeTransactionUI(row));
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.isInitialized = false;
            console.log('✓ Database connection closed');
        }
    }

    /**
     * Convert Transaction to TransactionUI with category object
     */
    private deserializeTransactionUI(row: any): TransactionUI {
        const transaction = this.deserializeTransaction(row);

        // Find the category object from CATEGORIES map
        const categoryKey = Object.keys(CATEGORIES).find(
            k => CATEGORIES[k as keyof typeof CATEGORIES].id === transaction.categoryId
        ) as keyof typeof CATEGORIES;

        const category: Category = categoryKey
            ? CATEGORIES[categoryKey]
            : {
                id: transaction.categoryId,
                name: 'Unknown',
                color: '#666666',
                type: 'expense' as const,
                icon: { ios: 'questionmark.square', android: 'help', web: 'help' }
            };

        return {
            id: transaction.id,
            amount: transaction.amount,
            date: transaction.date,
            note: transaction.note,
            labels: transaction.labels,
            category
        };
    }

    private deserializeTransaction(row: any): Transaction {
        return {
            id: row.id,
            categoryId: row.category_id,
            amount: row.amount,
            date: new Date(row.date),
            note: row.note || undefined,
            labels: row.labels ? JSON.parse(row.labels) : undefined,
        };
    }
}

// Singleton instance
export const database = new Database();
