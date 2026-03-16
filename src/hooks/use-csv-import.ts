/**
 * Hook for handling CSV file import
 * Parses CSV files and extracts transaction data
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { database } from '@/database';
import { Category } from '@/schemas/category';
import { Transaction } from '@/schemas/transaction';
import { getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';

/**
 * Type alias for transaction data during import
 * Uses Transaction schema without the auto-generated id
 */
export type ImportTransactionData = Omit<Transaction, 'id'>;

/**
 * Invalid import transaction row with validation error details
 */
export interface InvalidImportRow {
    rowIndex: number;
    date?: string;
    amount?: string;
    categoryTag?: string;
    description?: string;
    errors: string[];
}

/**
 * Import result containing valid and invalid transactions
 */
export interface ImportResult {
    valid: ImportTransactionData[];
    invalid: InvalidImportRow[];
}

/**
 * Field mapping configuration for handling different CSV header name variations
 */
const FIELD_MAPPING = {
    date: ['date', 'transaction date', 'trans date', 'posted date'],
    amount: ['amount', 'transaction amount', 'trans amount', 'value'],
    category: ['tags', 'category', 'type', 'transaction type'],
    description: ['remarks', 'description', 'transaction details', 'details', 'comment', 'notes']
};

/**
 * Find column index by checking multiple possible header names
 */
function findColumnIndex(headers: string[], fieldVariations: string[]): number {
    return headers.findIndex((header) =>
        fieldVariations.some((variation) =>
            header.toLowerCase().includes(variation.toLowerCase())
        )
    );
}

// Parse date from DD/MM/YYYY to Date object
function formatDate(dateStr: string): Date | null {
    try {
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return null;
        const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

// Normalize tag text (remove special chars, lowercase)
function normalizeTag(tag: string): string {
    return tag.replace(/[#?? ]+/g, '').trim().toLowerCase();
}

// Find matching category from database categories based on normalized tag
function findCategoryId(normalizedTag: string, categories: Category[]): number | undefined {
    const match = categories.find((cat) => cat.name.toLowerCase() === normalizedTag);
    return match?.id;
}

export function useCSVImport() {
    const [importedData, setImportedData] = useState<ImportTransactionData[]>([]);
    const [invalidRows, setInvalidRows] = useState<InvalidImportRow[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Load categories from database on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                await database.init();
                const cats = await database.getCategories();
                setCategories(cats);
            } catch (error) {
                console.error('Failed to load categories:', error);
                Alert.alert('Error', 'Failed to load categories from database');
            }
        };

        loadCategories();
    }, []);

    const parseCSV = useCallback((csvText: string): ImportResult => {
        try {
            const lines = csvText.split('\n').filter((line: string) => line.trim());

            if (lines.length < 2) {
                Alert.alert('Error', 'CSV file is empty or has no data rows');
                return { valid: [], invalid: [] };
            }

            const headers = lines[0].split(',').map((h: string) => h.trim());

            // Use field mapping to find columns
            const dateIndex = findColumnIndex(headers, FIELD_MAPPING.date);
            const amountIndex = findColumnIndex(headers, FIELD_MAPPING.amount);
            const categoryIndex = findColumnIndex(headers, FIELD_MAPPING.category);
            const descriptionIndex = findColumnIndex(headers, FIELD_MAPPING.description);

            if (dateIndex === -1 || amountIndex === -1 || categoryIndex === -1) {
                Alert.alert('Error', 'CSV must have Date, Amount, and Category columns');
                return { valid: [], invalid: [] };
            }

            const valid: ImportTransactionData[] = [];
            const invalid: InvalidImportRow[] = [];

            lines.slice(1).forEach((line: string, lineIndex: number) => {
                const cols = line.split(',').map((c: string) => c.trim());
                const dateStr = cols[dateIndex] || '';
                const amountStr = cols[amountIndex] || '0';
                const categoryStr = cols[categoryIndex] || '';
                const descriptionStr = descriptionIndex !== -1 ? cols[descriptionIndex] : '';

                const date = formatDate(dateStr);
                const amount = parseFloat(amountStr.replace(/,/g, ''));
                const normalizedTag = normalizeTag(categoryStr);
                const categoryId = findCategoryId(normalizedTag, categories);

                const errors: string[] = [];
                if (!date) errors.push('Invalid date format');
                if (isNaN(amount)) errors.push('Invalid amount');
                if (!categoryId) errors.push(`Category "${categoryStr}" not found`);

                if (errors.length > 0) {
                    invalid.push({
                        rowIndex: lineIndex + 2, // +2 for header and 1-based indexing
                        date: dateStr,
                        amount: amountStr,
                        categoryTag: categoryStr,
                        description: descriptionStr,
                        errors,
                    });
                } else {
                    valid.push({
                        date: date!,
                        amount,
                        categoryId: categoryId!,
                        note: descriptionStr || undefined,
                    });
                }
            });

            if (valid.length === 0 && invalid.length === 0) {
                Alert.alert('Error', 'No data rows found in CSV');
                return { valid: [], invalid: [] };
            }

            return { valid, invalid };
        } catch (error: any) {
            Alert.alert('Error', `Failed to parse CSV: ${String(error).substring(0, 100)}`);
            return { valid: [], invalid: [] };
        }
    }, [categories]);

    const importFromText = useCallback(
        (csvText: string): boolean => {
            const result = parseCSV(csvText);
            if (result.valid.length > 0 || result.invalid.length > 0) {
                setImportedData(result.valid);
                setInvalidRows(result.invalid);
                return true;
            }
            return false;
        },
        [parseCSV]
    );

    const clearImportedData = useCallback(() => {
        setImportedData([]);
        setInvalidRows([]);
    }, []);

    const importFromFile = useCallback(
        async (fileUri: string): Promise<ImportResult> => {
            try {
                const fileInfo = await getInfoAsync(fileUri);

                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File not found at the specified location.');
                    return { valid: [], invalid: [] };
                }

                const fileContent = await readAsStringAsync(fileUri, { encoding: 'utf8' });
                const parseResult = parseCSV(fileContent);

                setImportedData(parseResult.valid);
                setInvalidRows(parseResult.invalid);

                return parseResult;
            } catch (error: any) {
                const errorMessage = error.message || String(error).substring(0, 100);
                Alert.alert('Error', `Failed to read file: ${errorMessage}`);
                return { valid: [], invalid: [] };
            }
        },
        [parseCSV]
    );

    return {
        importedData,
        invalidRows,
        importFromText,
        importFromFile,
        clearImportedData,
    };
}
