/**
 * Service for importing CSV transactions to the database
 * Handles database insertion logic
 */

import { database } from '@/database';
import { CSVTransactionData } from '@/hooks/use-csv-import';

export interface ImportResult {
    successCount: number;
    failureCount: number;
}

/**
 * Imports parsed CSV transactions to the database
 * @param transactions - Array of parsed transactions from CSV (CSVTransactionData)
 * @returns Object with successCount and failureCount
 */
export async function importTransactionsToDatabase(
    transactions: CSVTransactionData[]
): Promise<ImportResult> {
    let successCount = 0;
    let failureCount = 0;

    for (const transaction of transactions) {
        try {
            await database.insertTransaction({
                categoryId: transaction.categoryId,
                amount: transaction.amount,
                date: transaction.date,
                note: transaction.note || undefined,
                labels: transaction.labels || [],
            });

            successCount++;
        } catch (error) {
            console.error('Error importing transaction:', error);
            failureCount++;
        }
    }

    return { successCount, failureCount };
}
