#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * Populates the database with initial test data:
 * - Categories (from constants/categories.ts)
 * - Sample transactions (from data/transactions.ts)
 * 
 * Usage:
 *   npm run db:seed
 * 
 * This script is for development purposes only and should NOT be run in production.
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA } from '../src/database/schema';
import { CATEGORIES } from '../src/constants/categories';
import { TRANSACTION_SECTIONS } from '../src/data/transactions';

const DATABASE_NAME = 'spendly.db';

interface SeedOptions {
    force?: boolean; // Force seed even if data exists
}

class DatabaseSeeder {
    private db: SQLite.SQLiteDatabase | null = null;

    async seed(options: SeedOptions = {}) {
        try {
            console.log('🌱 Starting database seeding...\n');

            // Open database
            this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            console.log('✓ Database connection opened');

            // Create tables
            await this.createTables();
            console.log('✓ Database tables created');

            // Check if data already exists
            const dataExists = await this.checkIfDataExists();
            if (dataExists && !options.force) {
                console.warn('⚠️  Database already contains data. Use --force to override.');
                console.log(
                    '   Run: npm run db:seed -- --force'
                );
                return;
            }

            if (dataExists && options.force) {
                console.log('🔄 Forcing re-seed (clearing existing data)...\n');
                await this.clearData();
                console.log('✓ Existing data cleared');
            }

            // Seed categories
            const categoryIdMap = await this.seedCategories();
            console.log('✓ Categories seeded');

            // Seed transactions
            await this.seedTransactions(categoryIdMap);
            console.log('✓ Transactions seeded');

            // Summary
            const stats = await this.getStats();
            console.log(`\n✅ Seeding complete!`);
            console.log(`   Categories: ${stats.categoryCount}`);
            console.log(`   Transactions: ${stats.transactionCount}`);

        } catch (error) {
            console.error('❌ Seeding failed:', error);
            throw error;
        } finally {
            if (this.db) {
                await this.db.closeAsync();
                console.log('\n✓ Database connection closed');
            }
        }
    }

    private async checkIfDataExists(): Promise<boolean> {
        if (!this.db) throw new Error('Database not connected');

        try {
            const result = await this.db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM transactions'
            );
            return (result?.count || 0) > 0;
        } catch {
            return false;
        }
    }

    private async createTables() {
        if (!this.db) throw new Error('Database not connected');

        const statements = DATABASE_SCHEMA.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await this.db.execAsync(statement);
            } catch (error: any) {
                // Ignore table already exists errors
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }
    }

    private async clearData() {
        if (!this.db) throw new Error('Database not connected');

        await this.db.execAsync('DELETE FROM transactions');
        await this.db.execAsync('DELETE FROM categories');
    }

    private async seedCategories(): Promise<Map<string, number>> {
        if (!this.db) throw new Error('Database not connected');

        const categoryIdMap = new Map<string, number>();

        for (const category of Object.values(CATEGORIES)) {
            try {
                // Clear icon data before inserting
                const iconData = typeof category.icon === 'object' ? category.icon : {};

                await this.db.runAsync(
                    `INSERT OR IGNORE INTO categories (name, icon_ios, icon_android, icon_web, color, type)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        category.name,
                        iconData.ios || '',
                        iconData.android || '',
                        iconData.web || '',
                        category.color,
                        category.type,
                    ]
                );

                // Get the actual ID from database
                const row = await this.db.getFirstAsync<{ id: number }>(
                    'SELECT id FROM categories WHERE name = ?',
                    [category.name]
                );

                if (row) {
                    categoryIdMap.set(category.name, row.id);
                }
            } catch (error) {
                console.error(`  ❌ Failed to seed category "${category.name}":`, error);
            }
        }

        return categoryIdMap;
    }

    private async seedTransactions(categoryIdMap: Map<string, number>) {
        if (!this.db) throw new Error('Database not connected');

        let successCount = 0;
        let failCount = 0;

        for (const dailyTransactions of TRANSACTION_SECTIONS) {
            for (const transaction of dailyTransactions.transactions) {
                try {
                    const categoryId = categoryIdMap.get(transaction.category.name);

                    if (!categoryId) {
                        console.warn(`  ⚠️  Category not found: "${transaction.category.name}"`);
                        failCount++;
                        continue;
                    }

                    await this.db.runAsync(
                        `INSERT INTO transactions (category_id, amount, date, note, labels)
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

                    successCount++;
                } catch (error) {
                    console.error('  ❌ Failed to seed transaction:', error);
                    failCount++;
                }
            }
        }

        if (failCount > 0) {
            console.warn(`  ⚠️  ${failCount} transactions failed to seed`);
        }
    }

    private async getStats(): Promise<{ categoryCount: number; transactionCount: number }> {
        if (!this.db) throw new Error('Database not connected');

        const categories = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM categories'
        );

        const transactions = await this.db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM transactions'
        );

        return {
            categoryCount: categories?.count || 0,
            transactionCount: transactions?.count || 0,
        };
    }
}

// Run seeding
const seeder = new DatabaseSeeder();
const args = process.argv.slice(2);
const options = {
    force: args.includes('--force'),
};

seeder
    .seed(options)
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
