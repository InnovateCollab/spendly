import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { database } from '@/database';

interface UseInitializeAppReturn {
    isInitialized: boolean;
    error: Error | null;
    isInitializing: boolean;
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
