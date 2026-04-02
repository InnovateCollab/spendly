import React, { createContext, useContext, useState } from 'react';

interface AddTransactionContextType {
    isOpen: boolean;
    openAddTransaction: () => void;
    closeAddTransaction: () => void;
}

const AddTransactionContext = createContext<AddTransactionContextType | undefined>(undefined);

export function AddTransactionProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openAddTransaction = () => setIsOpen(true);
    const closeAddTransaction = () => setIsOpen(false);

    return (
        <AddTransactionContext.Provider value={{ isOpen, openAddTransaction, closeAddTransaction }}>
            {children}
        </AddTransactionContext.Provider>
    );
}

export function useAddTransaction() {
    const context = useContext(AddTransactionContext);
    if (!context) {
        throw new Error('useAddTransaction must be used within AddTransactionProvider');
    }
    return context;
}
