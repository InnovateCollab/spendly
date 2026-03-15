import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { database } from '@/database';
import { CATEGORIES } from '@/constants/categories';
import { TRANSACTION_SECTIONS } from '@/data/seed-transactions';

interface UseInitializeAppReturn {
    isInitialized: boolean;
    error: Error | null;
    isInitializing: boolean;
}

/**
 * Seed database with test data (categories and transactions)
 * Called on first app launch if database is empty
 */
async function seedDatabase() {
    try {
        // Seed categories
        for (const category of Object.values(CATEGORIES)) {
            await database.insertCategory({
                name: category.name,
                icon: category.icon,
                color: category.color,
                type: category.type,
            });
        }
        console.log('✓ Categories seeded');

        // Seed transactions
        const transactions = TRANSACTION_SECTIONS.flatMap(section => section.transactions);
        for (const tx of transactions) {
            await database.insertTransaction({
                categoryId: tx.category.id,
                amount: tx.amount,
                date: tx.date,
                note: tx.note,
                labels: tx.labels,
            });
        }
        console.log(`✓ ${transactions.length} transactions seeded`);
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

/**
 * Check if database has data, seed if empty
 */
async function seedIfEmpty() {
    try {
        const transactions = await database.getTransactions();
        if (transactions.length === 0) {
            console.log('🌱 Database empty, seeding test data...');
            await seedDatabase();
        }
    } catch (error) {
        console.error('Error checking/seeding database:', error);
        // Non-fatal: let app continue even if seeding fails
    }
}

/**
 * Custom hook to handle app initialization (database, etc.)
 * Initialization happens in the background without blocking UI
 * @returns Object with initialization state
 */
export function useInitializeApp(): UseInitializeAppReturn {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization in strict mode
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initializeApp = async () => {
            try {
                // Initialize database (auto-selects native or web version)
                if (Platform.OS !== 'web') {
                    await database.init();
                    // Auto-seed on first launch if database is empty
                    await seedIfEmpty();
                }
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                console.error('App initialization failed:', error);
                setError(error);
                // Even if initialization fails, allow app to continue with graceful degradation
                setIsInitialized(true);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeApp();
    }, []);

    return { isInitialized, error, isInitializing };
}
