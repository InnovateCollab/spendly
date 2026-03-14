#!/usr/bin/env node

/**
 * Database Reset Script
 * 
 * Resets the database by:
 * 1. Deleting all data from tables (or dropping tables)
 * 2. Optionally removing the entire database file
 * 
 * Usage:
 *   npm run db:reset          # Clear data only
 *   npm run db:reset -- --hard # Remove database file entirely
 * 
 * This script is for development purposes only and should NOT be run in production.
 */

import * as SQLite from 'expo-sqlite';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_NAME = 'spendly.db';

interface ResetOptions {
    hard?: boolean; // Delete entire database file
    confirm?: boolean; // Skip confirmation prompt
}

class DatabaseReset {
    async reset(options: ResetOptions = {}) {
        try {
            console.log('⚠️  Database Reset\n');

            if (options.hard) {
                console.log('This will DELETE the entire database file.\n');
                await this.hardReset();
            } else {
                console.log('This will DELETE all data from the database.\n');
                await this.softReset();
            }

            console.log('\n✅ Database reset complete!');

            if (options.hard) {
                console.log('💡 Tip: Run "npm run db:seed" to repopulate with test data');
            }

        } catch (error) {
            console.error('❌ Reset failed:', error);
            throw error;
        }
    }

    private async softReset() {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            console.log('✓ Database connection opened');

            // Clear all data
            await db.execAsync('DELETE FROM transactions');
            console.log('✓ Transactions cleared');

            await db.execAsync('DELETE FROM categories');
            console.log('✓ Categories cleared');

            await db.closeAsync();
            console.log('✓ Database connection closed');

        } catch (error) {
            console.error('Error during soft reset:', error);
            throw error;
        }
    }

    private async hardReset() {
        try {
            // Try to close the database connection first
            try {
                const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
                await db.closeAsync();
            } catch {
                // Database might not exist, ignore
            }

            // Find and delete database files
            const dbPath = path.join(process.cwd(), DATABASE_NAME);
            const dbFileExists = fs.existsSync(dbPath);

            if (dbFileExists) {
                fs.unlinkSync(dbPath);
                console.log(`✓ Database file deleted: ${DBias_NAME}`);
            } else {
                console.log(`ℹ️  Database file not found at: ${dbPath}`);
            }

            // Also try to delete -shm and -wal files if they exist
            const patterns = [`${dbPath}-shm`, `${dbPath}-wal`];
            for (const pattern of patterns) {
                if (fs.existsSync(pattern)) {
                    fs.unlinkSync(pattern);
                    console.log(`✓ Temp file deleted: ${path.basename(pattern)}`);
                }
            }

        } catch (error) {
            console.error('Error during hard reset:', error);
            throw error;
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ResetOptions = {
    hard: args.includes('--hard'),
    confirm: args.includes('--confirm') || args.includes('-y'),
};

// Run reset
const reset = new DatabaseReset();
reset
    .reset(options)
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
