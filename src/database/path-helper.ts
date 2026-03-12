/**
 * Database File Access Helper
 * Provides path information and instructions for CLI access
 */

import { Platform } from 'react-native';

export class DatabasePathHelper {
    static async getDbPath(): Promise<string> {
        // Expo SQLite stores database in native app directory
        // Database name is enough - SQLite handles the path internally
        return 'spendly.db';
    }

    static async logDbPath(): Promise<void> {
        const dbPath = await this.getDbPath();
        console.log('\n' + '='.repeat(60));
        console.log('📁 DATABASE FILE:');
        console.log('='.repeat(60));
        console.log(`Name: ${dbPath}`);
        console.log(`Platform: ${Platform.OS}`);
        console.log('='.repeat(60) + '\n');
    }

    static logCliInstructions(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMMAND-LINE ACCESS INSTRUCTIONS:');
        console.log('='.repeat(60));

        console.log('\n📱 For iOS Simulator:');
        console.log('  simctl list devices');
        console.log('  # Find your simulator device ID, then:');
        console.log('  sqlite3 "~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Documents/spendly.db"');

        console.log('\n🤖 For Android Emulator:');
        console.log('  adb devices');
        console.log('  adb exec-out run-as com.spendly.app cat databases/spendly.db > spendly.db');
        console.log('  sqlite3 spendly.db');

        console.log('\n💡 Common SQLite Commands:');
        console.log('  .tables                           # List all tables');
        console.log('  .schema                           # Show all table schemas');
        console.log('  .schema transactions              # Show specific table schema');
        console.log('  SELECT * FROM categories;         # List categories');
        console.log('  SELECT * FROM transactions;       # List transactions');
        console.log('  SELECT COUNT(*) FROM transactions; # Count transactions');
        console.log('  .mode column                      # Pretty column format');
        console.log('  .quit                             # Exit SQLite');

        console.log('\n='.repeat(60) + '\n');
    }
}

// Log on import
DatabasePathHelper.logCliInstructions();
