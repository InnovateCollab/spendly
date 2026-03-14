/**
 * Hook for handling CSV file import
 * Parses CSV files and extracts transaction data
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { CATEGORIES } from '@/constants/categories';

export interface ImportedTransaction {
    date: string;
    amount: string;
    description: string;
    category: string;
}

// Parse date from DD/MM/YYYY to YYYY-MM-DD
function formatDate(dateStr: string): string {
    try {
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return '';
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
        return '';
    }
}

// Normalize tag text (remove special chars, lowercase)
function normalizeTag(tag: string): string {
    return tag.replace(/[#?? ]+/g, '').trim().toLowerCase();
}

// Find matching category key from CATEGORIES based on normalized tag
function findCategoryKey(normalizedTag: string): string | undefined {
    // Direct match against CATEGORIES keys
    const directMatch = Object.keys(CATEGORIES).find((key) => key === normalizedTag);
    if (directMatch) return directMatch;

    // Alias matching for common variations
    const aliases: Record<string, string> = {
        grocery: 'groceries',
        shopping: 'shopping',
        taxi: 'parking',
        transport: 'parking',
        food: 'dining',
        medical: 'pharmacy',
        billpayments: 'entertainment',
        moneytransfer: 'entertainment',
    };

    const aliasKey = aliases[normalizedTag];
    if (aliasKey && Object.keys(CATEGORIES).includes(aliasKey)) {
        return aliasKey;
    }

    return undefined;
}

export function useCSVImport() {
    const [importedData, setImportedData] = useState<ImportedTransaction[]>([]);

    const parseCSV = useCallback((csvText: string): ImportedTransaction[] => {
        try {
            const lines = csvText.split('\n').filter((line: string) => line.trim());

            if (lines.length < 2) {
                Alert.alert('Error', 'CSV file is empty or has no data rows');
                return [];
            }

            const headers = lines[0].split(',').map((h: string) => h.trim());
            const dateIndex = headers.findIndex((h: string) => h.includes('Date'));
            const amountIndex = headers.findIndex((h: string) => h.includes('Amount'));
            const tagsIndex = headers.findIndex((h: string) => h.includes('Tags'));
            const remarksIndex = headers.findIndex((h: string) => h.includes('Remarks'));
            const detailsIndex = headers.findIndex((h: string) => h.includes('Transaction Details'));
            const commentIndex = headers.findIndex((h: string) => h.includes('Comment'));

            if (dateIndex === -1 || amountIndex === -1 || tagsIndex === -1) {
                Alert.alert('Error', 'CSV must have Date, Amount, and Tags columns');
                return [];
            }

            const data = lines
                .slice(1)
                .map((line: string) => {
                    const cols = line.split(',').map((c: string) => c.trim());
                    const dateStr = cols[dateIndex] || '';
                    const amountStr = cols[amountIndex] || '0';
                    const tagsStr = cols[tagsIndex] || '';
                    const remarksStr = cols[remarksIndex] || '';
                    const detailsStr = cols[detailsIndex] || '';
                    const commentStr = cols[commentIndex] || '';

                    const formattedDate = formatDate(dateStr);
                    const cleanAmount = amountStr.replace(/,/g, '');
                    const normalizedTag = normalizeTag(tagsStr);
                    const categoryKey = findCategoryKey(normalizedTag);
                    const category = categoryKey ? CATEGORIES[categoryKey].name : 'Unknown';
                    const description = [remarksStr, detailsStr, commentStr].filter((s) => s).join(' - ').trim();

                    return {
                        date: formattedDate,
                        amount: cleanAmount,
                        description: description || 'Transaction',
                        category,
                    };
                })
                .filter((row: ImportedTransaction) => row.date && row.amount && row.amount !== '0');

            if (data.length === 0) {
                Alert.alert('Error', 'No valid transactions found in CSV');
                return [];
            }

            return data;
        } catch (error: any) {
            Alert.alert('Error', `Failed to parse CSV: ${String(error).substring(0, 100)}`);
            return [];
        }
    }, []);

    const importFromText = useCallback(
        (csvText: string): boolean => {
            const data = parseCSV(csvText);
            if (data.length > 0) {
                setImportedData(data);
                return true;
            }
            return false;
        },
        [parseCSV]
    );

    const clearImportedData = useCallback(() => {
        setImportedData([]);
    }, []);

    return {
        importedData,
        importFromText,
        clearImportedData,
    };
}
