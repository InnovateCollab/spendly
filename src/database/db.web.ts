/**
 * IndexedDB Database for Web Platform
 * Provides persistent data storage for transactions and categories
 * Uses IndexedDB API for browser storage
 */

import { TRANSACTION_SECTIONS } from '@/data/seed-transactions';
import { CATEGORIES } from '@/constants/categories';
import { Transaction, TransactionUI, DailyTransactions } from '@/schemas/transaction';
import { Category } from '@/schemas/category';

// Type declarations for browser APIs
declare const window: any;
declare const global: any;

class IndexedDBDatabase {
    private db: any = null;
    private dbName = 'spendly-web-db';
    private version = 1;
    private transactionStore = 'transactions';
    private categoryStore = 'categories';
    private metadataStore = 'metadata';

    // ============================================
    // INITIALIZATION & CONNECTION
    // ============================================

    async init() {
        return new Promise<void>((resolve, reject) => {
            const indexedDB = (typeof window !== 'undefined' && window.indexedDB) || ((global as any).indexedDB);
            if (!indexedDB) {
                reject(new Error('IndexedDB not available in this environment'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('✗ Failed to open IndexedDB:', (request as any).error);
                reject((request as any).error);
            };

            request.onsuccess = async () => {
                this.db = request.result;
                console.log('✓ IndexedDB database opened');

                try {
                    await this._initializeStoresIfNeeded();
                    console.log('✓ IndexedDB stores initialized');
                    resolve();
                } catch (err) {
                    console.log('✗ Failed to initialize stores:', err);
                    reject(err);
                }
            };

            request.onupgradeneeded = (event: any) => {
                const db = (event.target as any).result;
                this._createStores(db);
            };
        });
    }

    private _createStores(db: any) {
        // Create transaction store
        if (!db.objectStoreNames.contains(this.transactionStore)) {
            const txStore = db.createObjectStore(this.transactionStore, { keyPath: 'id', autoIncrement: true });
            txStore.createIndex('date', 'date', { unique: false });
            txStore.createIndex('categoryId', 'categoryId', { unique: false });
        }

        // Create category store
        if (!db.objectStoreNames.contains(this.categoryStore)) {
            db.createObjectStore(this.categoryStore, { keyPath: 'id' });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(this.metadataStore)) {
            db.createObjectStore(this.metadataStore, { keyPath: 'key' });
        }
    }

    private async _initializeStoresIfNeeded() {
        if (!this.db) {
            console.log('Database object is null during initialization');
        }

        try {
            // Check if categories exist
            const categories = await this._getFromStore(this.categoryStore);
            if (categories.length === 0) {
                console.log('🔄 Initializing categories...');
                // Initialize with seed categories
                await this._initializeCategories();
            }

            // Check if we should seed transactions on first load
            const metadata = await this._getFromStore(this.metadataStore);
            const initialized = metadata.find((m: any) => m.key === 'initialized');

            if (!initialized) {
                console.log('🔄 Seeding initial transactions...');
                // Seed initial transactions from TRANSACTION_SECTIONS
                await this._seedTransactions();
                await this._setMetadata('initialized', true);
                console.log('✓ Transactions seeded');
            } else {
                console.log('✓ Database already initialized');
            }
        } catch (err) {
            console.error('✗ Error during store initialization:', err);
            throw err;
        }
    }

    private async _initializeCategories() {
        if (!this.db) return;

        const categoryArray = Object.values(CATEGORIES);
        for (const category of categoryArray) {
            const iconWeb = typeof category.icon === 'string'
                ? category.icon
                : (category.icon as any).web || 'questionmark.circle';

            await this._addToStore(this.categoryStore, {
                id: category.id,
                name: category.name,
                icon: iconWeb,
                color: category.color,
                type: category.type,
            });
        }
    }

    private async _seedTransactions() {
        if (!this.db) return;

        for (const section of TRANSACTION_SECTIONS) {
            for (const tx of section.transactions) {
                await this._addToStore(this.transactionStore, {
                    id: tx.id,
                    categoryId: tx.category.id,
                    amount: tx.amount,
                    date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
                    note: tx.note,
                    labels: tx.labels,
                });
            }
        }
    }

    private async _setMetadata(key: string, value: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([this.metadataStore], 'readwrite');
            const store = tx.objectStore(this.metadataStore);
            const request = store.put({ key, value });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async close() {
        if (this.db) {
            this.db.close();
            console.log('✓ IndexedDB connection closed');
        }
    }

    // ============================================
    // CRUD: CREATE
    // ============================================

    async insertTransaction(transaction: Omit<Transaction, 'id'>) {
        return new Promise<number>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([this.transactionStore], 'readwrite');
            const store = tx.objectStore(this.transactionStore);
            const request = store.add({
                ...transaction,
                date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
            });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result as number);
        });
    }

    async insertCategory() {
        // Categories are managed separately via seed data
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
        const rows = await this._getFromStore(this.transactionStore);
        return rows
            .map(row => ({
                id: row.id,
                categoryId: row.categoryId,
                amount: row.amount,
                date: new Date(row.date),
                note: row.note,
                labels: row.labels,
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Get all transactions with category data (for UI display)
     */
    async getTransactionsWithCategories(): Promise<TransactionUI[]> {
        const transactions = await this.getTransactions();
        const categories = await this.getCategories();
        const categoryMap = new Map(categories.map(c => [c.id, c]));

        return transactions.map(tx => ({
            id: tx.id,
            category: categoryMap.get(tx.categoryId) || this._getDefaultCategory(),
            amount: tx.amount,
            date: tx.date,
            note: tx.note,
            labels: tx.labels,
        }));
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

    /**
     * Get all categories stored in IndexedDB
     */
    async getCategories(): Promise<Category[]> {
        const rows = await this._getFromStore(this.categoryStore);
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.icon as any,
            color: row.color,
            type: row.type,
        }));
    }

    // ============================================
    // CRUD: UPDATE
    // ============================================

    async updateTransaction(id: number, transaction: Partial<Transaction>) {
        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([this.transactionStore], 'readwrite');
            const store = tx.objectStore(this.transactionStore);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const existing = request.result;
                if (existing) {
                    const updated = {
                        ...existing,
                        ...transaction,
                        date: transaction.date instanceof Date ? transaction.date.toISOString() : (transaction.date || existing.date),
                    };
                    const updateRequest = store.put(updated);
                    updateRequest.onerror = () => reject(updateRequest.error);
                    updateRequest.onsuccess = () => resolve();
                } else {
                    reject(new Error(`Transaction with id ${id} not found`));
                }
            };
        });
    }

    // ============================================
    // CRUD: DELETE
    // ============================================

    async deleteTransaction(id: number) {
        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([this.transactionStore], 'readwrite');
            const store = tx.objectStore(this.transactionStore);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Clear all transactions (for testing)
     */
    async clearTransactions() {
        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([this.transactionStore], 'readwrite');
            const store = tx.objectStore(this.transactionStore);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private _getDefaultCategory(): Category {
        return {
            id: 0,
            name: 'Unknown',
            icon: 'questionmark.circle' as any,
            color: '#6b7280',
            type: 'expense',
        };
    }

    private async _getFromStore(storeName: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    private async _addToStore(storeName: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.add(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

export const database = new IndexedDBDatabase();
