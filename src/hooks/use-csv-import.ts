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
import { parse_auto, setDefaultFormat } from '@/utils/date-utils';

/**
 * Type alias for transaction data during import
 * Uses Transaction schema without the auto-generated id, includes row index for reference
 */
export type ImportTransactionData = Omit<Transaction, 'id'> & { rowIndex: number };

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
    date: ['date', 'transaction date', 'trans date', 'posted date', 'Booking Date'],
    amount: ['amount', 'transaction amount', 'trans amount', 'value'],
    category: ['tags', 'category', 'type', 'transaction type'],
    description: ['remarks', 'description', 'transaction details', 'details', 'comment', 'notes']
};

/**
 * Column mapping configuration from expected fields to CSV headers
 */
export interface ColumnMapping {
    [key: string]: string; // e.g., { 'Date': 'Booking Date', 'Amount': 'Amount (EUR)', ... }
}

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

/**
 * Get column index by user-selected header name
 */
function getColumnIndexByName(headers: string[], headerName: string): number {
    return headers.findIndex((h) => h === headerName);
}

// Normalize tag text (remove emojis, special chars, lowercase)
function normalizeTag(tag: string): string {
    // Remove emojis and special characters, keep only alphanumeric and spaces
    let normalized = tag
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // Remove emojis
        .replace(/[^a-z0-9\s]/gi, '') // Remove special characters, keep only letters, numbers, spaces
        .trim()
        .toLowerCase();

    // Remove extra spaces
    return normalized.replace(/\s+/g, ' ').trim();
}

// Find matching category from database categories based on normalized tag
function findCategoryId(normalizedTag: string, categories: Category[]): number | undefined {
    // First try exact match
    let match = categories.find((cat) => cat.name.toLowerCase() === normalizedTag);
    if (match) return match.id;

    // Then try partial/substring match (category name contains tag or vice versa)
    match = categories.find((cat) => {
        const catNameLower = cat.name.toLowerCase();
        return catNameLower.includes(normalizedTag) || normalizedTag.includes(catNameLower);
    });
    if (match) return match.id;

    // Finally try word-based matching (any word in category name matches any word in tag)
    const tagWords = normalizedTag.split(/\s+/);
    match = categories.find((cat) => {
        const catWords = cat.name.toLowerCase().split(/\s+/);
        return tagWords.some((word) => catWords.some((catWord) => catWord.includes(word) || word.includes(catWord)));
    });
    return match?.id;
}

export function useCSVImport() {
    const [importedData, setImportedData] = useState<ImportTransactionData[]>([]);
    const [invalidRows, setInvalidRows] = useState<InvalidImportRow[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [dateFormat, setDateFormat] = useState<string>('dd.MM.yyyy'); // Default format

    // Load categories from database on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                await database.init();
                const cats = await database.getCategories();
                setCategories(cats);
            } catch (error) {
                console.warn('Failed to load categories:', error);
            }
        };

        loadCategories();
    }, []);

    const parseCSV = useCallback((csvText: string): ImportResult => {
        try {
            // Set default format for this parsing session
            setDefaultFormat(dateFormat);

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

                const dateISO = parse_auto(dateStr);
                const date = dateISO ? new Date(dateISO) : null;
                const amount = parseFloat(amountStr.replace(/,/g, ''));
                const normalizedTag = normalizeTag(categoryStr);
                const categoryId = findCategoryId(normalizedTag, categories);

                const errors: string[] = [];
                if (!date) errors.push('Invalid date format');
                if (isNaN(amount)) errors.push('Invalid amount');
                if (!categoryId) errors.push(`Category "${categoryStr}" not found`);

                if (errors.length > 0) {
                    invalid.push({
                        rowIndex: lineIndex + 1,
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
                        rowIndex: lineIndex + 1,
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
    }, [categories, dateFormat]);

    const parseCSVWithFormat = useCallback((csvText: string, format: string): ImportResult => {
        try {
            // Set default format for this parsing session
            setDefaultFormat(format);

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

                const dateISO = parse_auto(dateStr);
                const date = dateISO ? new Date(dateISO) : null;
                const amount = parseFloat(amountStr.replace(/,/g, ''));
                const normalizedTag = normalizeTag(categoryStr);
                const categoryId = findCategoryId(normalizedTag, categories);

                const errors: string[] = [];
                if (!date) errors.push('Invalid date format');
                if (isNaN(amount)) errors.push('Invalid amount');
                if (!categoryId) errors.push(`Category "${categoryStr}" not found`);

                if (errors.length > 0) {
                    invalid.push({
                        rowIndex: lineIndex + 1, // +1 for 1-based indexing
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
                        rowIndex: lineIndex + 1,
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

    const parseCSVWithMapping = useCallback((csvText: string, format: string, mapping: ColumnMapping): ImportResult => {
        try {
            // Set default format for this parsing session
            setDefaultFormat(format);

            const lines = csvText.split('\n').filter((line: string) => line.trim());

            if (lines.length < 2) {
                // Silently return empty - user is still selecting columns
                return { valid: [], invalid: [] };
            }

            const headers = lines[0].split(',').map((h: string) => h.trim());

            // Use column mapping to find column indices
            const dateIndex = mapping['Date'] ? getColumnIndexByName(headers, mapping['Date']) : -1;
            const amountIndex = mapping['Amount'] ? getColumnIndexByName(headers, mapping['Amount']) : -1;
            const categoryIndex = mapping['Category'] ? getColumnIndexByName(headers, mapping['Category']) : -1;
            const descriptionIndex = mapping['Description'] ? getColumnIndexByName(headers, mapping['Description']) : -1;

            // If required columns aren't mapped, silently return empty - user is still selecting
            if (dateIndex === -1 || amountIndex === -1 || categoryIndex === -1) {
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

                const dateISO = parse_auto(dateStr);
                const date = dateISO ? new Date(dateISO) : null;
                const amount = parseFloat(amountStr.replace(/,/g, '').replace(/[^\d.-]/g, ''));
                const normalizedTag = normalizeTag(categoryStr);
                const categoryId = findCategoryId(normalizedTag, categories);

                const errors: string[] = [];
                if (!date) errors.push('Invalid date format');
                if (isNaN(amount)) errors.push('Invalid amount');
                if (!categoryId) errors.push(`Category "${categoryStr}" not found`);

                if (errors.length > 0) {
                    invalid.push({
                        rowIndex: lineIndex + 1,
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
                        rowIndex: lineIndex + 1,
                    });
                }
            });

            return { valid, invalid };
        } catch (error: any) {
            console.warn('Failed to parse CSV with mapping:', error);
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

    const parseCSVDirect = useCallback(
        (csvText: string): ImportResult => {
            const result = parseCSV(csvText);
            setImportedData(result.valid);
            setInvalidRows(result.invalid);
            return result;
        },
        [parseCSV]
    );

    const parseCSVDirectWithFormat = useCallback(
        (csvText: string, format: string): ImportResult => {
            const result = parseCSVWithFormat(csvText, format);
            setImportedData(result.valid);
            setInvalidRows(result.invalid);
            setDateFormat(format); // Also update the format state
            return result;
        },
        [parseCSVWithFormat]
    );

    const parseCSVDirectWithMapping = useCallback(
        (csvText: string, format: string, mapping: ColumnMapping): ImportResult => {
            const result = parseCSVWithMapping(csvText, format, mapping);
            setImportedData(result.valid);
            setInvalidRows(result.invalid);
            setDateFormat(format);
            return result;
        },
        [parseCSVWithMapping]
    );

    return {
        importedData,
        invalidRows,
        importFromText,
        importFromFile,
        parseCSVDirect,
        parseCSVDirectWithFormat,
        parseCSVDirectWithMapping,
        clearImportedData,
        dateFormat,
        setDateFormat,
    };
}
