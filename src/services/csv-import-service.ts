/**
 * Service for importing CSV transactions to the database
 * Handles category mapping and database insertion logic
 */

import { CATEGORIES } from '@/constants/categories';
import { database } from '@/database';
import { ImportedTransaction } from '@/hooks/use-csv-import';

export interface ImportResult {
    successCount: number;
    failureCount: number;
}

/**
 * Maps category name to category ID
 * Looks up category by exact name match
 */
function getCategoryIdByName(categoryName: string): number | undefined {
    const categoryKey = Object.keys(CATEGORIES).find(
        (key) =>
            CATEGORIES[key as keyof typeof CATEGORIES].name.toLowerCase() ===
            categoryName.toLowerCase()
    );

    if (!categoryKey) {
        return undefined;
    }

    return CATEGORIES[categoryKey as keyof typeof CATEGORIES].id;
}

/**
 * Imports parsed CSV transactions to the database
 * @param transactions - Array of parsed transactions from CSV
 * @returns Object with successCount and failureCount
 */
export async function importTransactionsToDatabase(
    transactions: ImportedTransaction[]
): Promise<ImportResult> {
    let successCount = 0;
    let failureCount = 0;

    for (const transaction of transactions) {
        try {
            const categoryId = getCategoryIdByName(transaction.category);

            if (!categoryId) {
                failureCount++;
                continue;
            }

            await database.insertTransaction({
                categoryId,
                amount: parseFloat(transaction.amount),
                date: new Date(transaction.date),
                note: transaction.description || undefined,
                labels: [],
            });

            successCount++;
        } catch (error) {
            console.error('Error importing transaction:', error);
            failureCount++;
        }
    }

    return { successCount, failureCount };
}
