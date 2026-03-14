import React, { createContext, useContext, useCallback, useState } from 'react';

/**
 * Database Refresh Context
 *
 * Purpose: Notify pages (Timeline, Overview) when database changes
 * so they can refresh their data without navigating away.
 *
 * Used By: Development features only
 * - Debug Menu (Reset/Reseed buttons)
 * - Any future operations that modify the database
 *
 * Architecture:
 * DevMenu (reset/reseed) → triggerRefresh() → Context broadcasts change
 *                                               ↓
 *                             Timeline & Overview receive refreshTrigger
 *                                               ↓
 *                             useEffect listeners reload data from database
 *
 * Why This Matters:
 * Without this, resetting/reseeding data wouldn't be visible to users
 * because pages stay in focus and don't know the database changed.
 * This provides a "notification" system for database changes.
 */

interface DatabaseContextType {
    refreshTrigger: number;
    triggerRefresh: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <DatabaseContext.Provider value={{ refreshTrigger, triggerRefresh }}>
            {children}
        </DatabaseContext.Provider>
    );
}

/**
 * Hook to access database refresh trigger
 * Use in pages that display database data to react to changes
 *
 * Example:
 * const { refreshTrigger } = useDatabaseRefresh();
 *
 * useEffect(() => {
 *   loadData(); // Will run when database changes
 * }, [refreshTrigger]);
 */
export function useDatabaseRefresh() {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabaseRefresh must be used within DatabaseProvider');
    }
    return context;
}
