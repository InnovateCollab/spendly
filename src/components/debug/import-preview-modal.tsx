import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Platform, FlatList } from 'react-native';
import { MaxContentWidth } from '@/constants/theme';
import { database } from '@/database';
import { ImportTransactionData, InvalidImportRow, ImportResult, ColumnMapping } from '@/hooks/use-csv-import';
import { Category } from '@/schemas/category';

interface ImportPreviewModalProps {
    visible: boolean;
    importedData: ImportTransactionData[];
    invalidRows?: InvalidImportRow[];
    onClose: () => void;
    onConfirm: () => void;
    dateFormat?: string;
    onDateFormatChange?: (format: string) => void;
    rawCsvText?: string;
    onReparseWithFormat?: (format: string) => Promise<ImportResult>;
    onReparseWithMapping?: (format: string, mapping: ColumnMapping) => Promise<ImportResult>;
}

// Common date format orders (separators are handled automatically)
const COMMON_FORMATS = [
    { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },  // Day first
    { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },  // Month first (US)
    { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },  // ISO format
];

export function ImportPreviewModal({
    visible,
    importedData,
    invalidRows = [],
    onClose,
    onConfirm,
    dateFormat = 'dd.MM.yyyy',
    onDateFormatChange,
    rawCsvText,
    onReparseWithFormat,
    onReparseWithMapping,
}: ImportPreviewModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFormatPicker, setShowFormatPicker] = useState(false);
    const [isReparsing, setIsReparsing] = useState(false);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping>({
        'Date': '',
        'Description': '',
        'Category': '',
        'Amount': '',
    });
    const [openMappingDropdown, setOpenMappingDropdown] = useState<string | null>(null);

    // Auto-detect columns on first modal open
    useEffect(() => {
        if (visible && rawCsvText) {
            initializeColumnMappings();
        }
    }, [visible, rawCsvText]);

    const initializeColumnMappings = () => {
        const headers = getCSVHeaders();
        if (headers.length === 0) return;

        // Field mapping for auto-detection
        const fieldMapping = {
            date: ['date', 'transaction date', 'trans date', 'posted date', 'booking date'],
            amount: ['amount', 'transaction amount', 'trans amount', 'value'],
            category: ['tags', 'category', 'type', 'transaction type'],
            description: ['remarks', 'description', 'transaction details', 'details', 'comment', 'notes']
        };

        // Find column indices by checking multiple possible header names
        const findColumn = (fieldVariations: string[]): string => {
            const found = headers.find(header =>
                fieldVariations.some(variation =>
                    header.toLowerCase().includes(variation.toLowerCase())
                )
            );
            return found || '';
        };

        // Set initial mappings based on auto-detection
        setColumnMappings({
            'Date': findColumn(fieldMapping.date),
            'Amount': findColumn(fieldMapping.amount),
            'Category': findColumn(fieldMapping.category),
            'Description': findColumn(fieldMapping.description),
        });
    };

    useEffect(() => {
        if (visible) {
            loadCategories();
        }
    }, [visible]);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            await database.init();
            const cats = await database.getCategories();
            setCategories(cats);
        } catch (error) {
            console.warn('Failed to load categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryById = (categoryId: number): Category | undefined => {
        return categories.find((cat) => cat.id === categoryId);
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleFormatChange = async (newFormat: string) => {
        if (onReparseWithFormat) {
            try {
                setIsReparsing(true);
                await onReparseWithFormat(newFormat);
                // The parent will update the importedData and invalidRows automatically
                setShowFormatPicker(false);
            } catch (error) {
                console.warn('Failed to reparse with new format:', error);
            } finally {
                setIsReparsing(false);
            }
        } else {
            setShowFormatPicker(false);
        }
    };

    const getCSVHeaders = (): string[] => {
        if (!rawCsvText) return [];
        const lines = rawCsvText.trim().split('\n');
        if (lines.length === 0) return [];
        // Split by comma and trim whitespace, but DO NOT remove quotes
        // The parsing functions will handle exact column names as they appear
        return lines[0].split(',').map(h => h.trim());
    };

    const getCSVDataRows = (count: number = 2): string[][] => {
        if (!rawCsvText) return [];
        const lines = rawCsvText.trim().split('\n');
        if (lines.length < 2) return [];
        // Get first `count` data rows (skip header)
        // Keep values as-is to show exactly what's in the file
        return lines.slice(1, count + 1).map(line =>
            line.split(',').map(cell => cell.trim())
        );
    };

    const calculateColumnWidths = (): number[] => {
        const headers = getCSVHeaders();
        if (headers.length === 0) return [];

        // Calculate width for each column based on header length
        // Each character is roughly 6-7 pixels in our font, plus padding
        return headers.map(header => {
            const textWidth = header.length * 7;
            const paddingWidth = 16; // paddingHorizontal: 8 on both sides
            const minWidth = 80;
            return Math.max(textWidth + paddingWidth, minWidth);
        });
    };

    const expectedSchema = ['Date', 'Description', 'Category', 'Amount'];

    const handleColumnMapping = async (expectedColumn: string, csvColumn: string) => {
        const newMappings: ColumnMapping = {
            ...columnMappings,
            [expectedColumn]: csvColumn
        };
        setColumnMappings(newMappings);
        setOpenMappingDropdown(null);

        // Always re-parse with the new mapping whenever a column is selected
        if (onReparseWithMapping && rawCsvText) {
            try {
                setIsReparsing(true);
                await onReparseWithMapping(dateFormat, newMappings);
                // The parent will update the importedData and invalidRows automatically
            } catch (error) {
                console.warn('Failed to reparse with new mapping:', error);
            } finally {
                setIsReparsing(false);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    ...(Platform.OS === 'web' && {
                        alignItems: 'center',
                    }),
                }}
            >
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingTop: 20,
                        paddingHorizontal: 20,
                        paddingBottom: 40,
                        maxHeight: '90%',
                        flex: 1,
                        ...(Platform.OS === 'web' && {
                            maxWidth: MaxContentWidth,
                            width: '100%',
                        }),
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                        📋 Preview Imported Transactions
                    </Text>

                    {/* DATE FORMAT SELECTOR */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: '#666', marginBottom: 8 }}>
                            Date Format:
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFormatPicker(!showFormatPicker)}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ddd',
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: '#f9f9f9',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>
                                {COMMON_FORMATS.find(f => f.value === dateFormat)?.label || dateFormat}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#999' }}>▼</Text>
                        </TouchableOpacity>

                        {/* Format Picker Dropdown */}
                        {showFormatPicker && (
                            <View
                                style={{
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    backgroundColor: '#fff',
                                    maxHeight: 200,
                                }}
                            >
                                <FlatList
                                    data={COMMON_FORMATS}
                                    keyExtractor={(item) => item.value}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => handleFormatChange(item.value)}
                                            disabled={isReparsing}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 12,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#f0f0f0',
                                                backgroundColor:
                                                    dateFormat === item.value ? '#E8F8F6' : '#fff',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    color:
                                                        dateFormat === item.value ? '#4ECDC4' : '#333',
                                                    fontWeight:
                                                        dateFormat === item.value ? '600' : '400',
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}
                        {isReparsing && (
                            <View style={{ marginTop: 8, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#4ECDC4" />
                            </View>
                        )}
                    </View>

                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 15 }}>
                        Valid: {importedData.length} {invalidRows.length > 0 ? `• Errors: ${invalidRows.length}` : ''}
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#4ECDC4" />
                    ) : (
                        <ScrollView style={{ flex: 1, marginBottom: 20 }}>
                            {/* CSV DATA PREVIEW */}
                            {rawCsvText && (
                                <View
                                    style={{
                                        marginBottom: 20,
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        backgroundColor: '#f9f9f9',
                                    }}
                                >
                                    <View style={{ backgroundColor: '#E8F8F6', paddingHorizontal: 12, paddingVertical: 10 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#4ECDC4' }}>
                                            👀 Data Preview
                                        </Text>
                                    </View>

                                    <ScrollView horizontal={true} style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                                        <View>
                                            {/* Header Row */}
                                            <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                                                {getCSVHeaders().map((header, idx) => {
                                                    const columnWidth = calculateColumnWidths()[idx];
                                                    return (
                                                        <View
                                                            key={`header-${idx}`}
                                                            style={{
                                                                width: columnWidth,
                                                                backgroundColor: '#E8F8F6',
                                                                borderRadius: 4,
                                                                paddingHorizontal: 8,
                                                                paddingVertical: 6,
                                                                borderBottomWidth: 2,
                                                                borderBottomColor: '#4ECDC4',
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: 11,
                                                                    fontWeight: '600',
                                                                    color: '#4ECDC4',
                                                                }}
                                                                numberOfLines={2}
                                                            >
                                                                {header}
                                                            </Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            {/* Data Rows */}
                                            {getCSVDataRows(2).map((row, rowIdx) => (
                                                <View key={`row-${rowIdx}`} style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                                                    {row.map((cell, cellIdx) => {
                                                        const columnWidth = calculateColumnWidths()[cellIdx];
                                                        return (
                                                            <View
                                                                key={`cell-${rowIdx}-${cellIdx}`}
                                                                style={{
                                                                    width: columnWidth,
                                                                    backgroundColor: '#fff',
                                                                    borderRadius: 4,
                                                                    paddingHorizontal: 8,
                                                                    paddingVertical: 6,
                                                                    borderWidth: 1,
                                                                    borderColor: '#f0f0f0',
                                                                }}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: '#333',
                                                                    }}
                                                                    numberOfLines={2}
                                                                >
                                                                    {cell || '—'}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            {/* CSV HEADER MAPPING SECTION */}
                            {rawCsvText && (
                                <View
                                    style={{
                                        marginBottom: 20,
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        backgroundColor: '#f9f9f9',
                                    }}
                                >
                                    <View style={{ backgroundColor: '#E8F8F6', paddingHorizontal: 12, paddingVertical: 10 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#4ECDC4' }}>
                                            📊 Column Mapping
                                        </Text>
                                    </View>

                                    {/* Column Mapping Selectors */}
                                    <View style={{ paddingHorizontal: 12, paddingVertical: 12, gap: 12 }}>
                                        {expectedSchema.map((expectedCol, idx) => (
                                            <View key={idx}>
                                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 6 }}>
                                                    {expectedCol}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        setOpenMappingDropdown(
                                                            openMappingDropdown === expectedCol ? null : expectedCol
                                                        )
                                                    }
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: '#ddd',
                                                        borderRadius: 6,
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 8,
                                                        backgroundColor: columnMappings[expectedCol] ? '#E8F8F6' : '#fff',
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            color: columnMappings[expectedCol] ? '#4ECDC4' : '#999',
                                                            fontWeight: columnMappings[expectedCol] ? '600' : '400',
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {columnMappings[expectedCol] || 'Select column...'}
                                                    </Text>
                                                    <Text style={{ fontSize: 11, color: '#999' }}>▼</Text>
                                                </TouchableOpacity>

                                                {/* Dropdown Menu */}
                                                {openMappingDropdown === expectedCol && (
                                                    <View
                                                        style={{
                                                            marginTop: 4,
                                                            borderWidth: 1,
                                                            borderColor: '#ddd',
                                                            borderRadius: 6,
                                                            backgroundColor: '#fff',
                                                            maxHeight: 150,
                                                        }}
                                                    >
                                                        <FlatList
                                                            data={getCSVHeaders()}
                                                            keyExtractor={(item, i) => `${item}-${i}`}
                                                            scrollEnabled={true}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity
                                                                    onPress={() => handleColumnMapping(expectedCol, item)}
                                                                    style={{
                                                                        paddingHorizontal: 10,
                                                                        paddingVertical: 10,
                                                                        borderBottomWidth: 1,
                                                                        borderBottomColor: '#f0f0f0',
                                                                        backgroundColor:
                                                                            columnMappings[expectedCol] === item
                                                                                ? '#E8F8F6'
                                                                                : '#fff',
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color:
                                                                                columnMappings[expectedCol] === item
                                                                                    ? '#4ECDC4'
                                                                                    : '#333',
                                                                            fontWeight:
                                                                                columnMappings[expectedCol] === item
                                                                                    ? '600'
                                                                                    : '400',
                                                                        }}
                                                                        numberOfLines={1}
                                                                    >
                                                                        {item}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Helper text when no mappings are set */}
                            {importedData.length === 0 && invalidRows.length === 0 && rawCsvText && (
                                <View style={{ marginBottom: 20, backgroundColor: '#FFF3CD', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: '#FF9800' }}>
                                    <Text style={{ fontSize: 12, color: '#856404', fontWeight: '500' }}>
                                        💡 Select columns above to map your CSV headers to the expected format
                                    </Text>
                                </View>
                            )}

                            {/* VALID TRANSACTIONS SECTION */}
                            {importedData.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#27AE60' }}>
                                        ✓ Valid Transactions ({importedData.length})
                                    </Text>
                                    {importedData.map((transaction, index) => {
                                        const category = getCategoryById(transaction.categoryId);
                                        return (
                                            <View
                                                key={index}
                                                style={{
                                                    borderLeftWidth: 3,
                                                    borderLeftColor: '#27AE60',
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: '#f0f0f0',
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 10,
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>
                                                    Row {transaction.rowIndex}
                                                </Text>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 12, color: '#999' }}>
                                                        {formatDate(transaction.date)}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: '600',
                                                            color: '#333',
                                                        }}
                                                    >
                                                        {transaction.amount.toFixed(2)}
                                                    </Text>
                                                </View>

                                                <View style={{ marginBottom: 4 }}>
                                                    <View
                                                        style={{
                                                            backgroundColor: category?.color || '#999999',
                                                            paddingHorizontal: 10,
                                                            paddingVertical: 4,
                                                            borderRadius: 6,
                                                            alignSelf: 'flex-start',
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontSize: 12,
                                                                color: '#fff',
                                                                fontWeight: '500',
                                                            }}
                                                        >
                                                            {category?.name || 'Unknown'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {transaction.note && (
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#666',
                                                            marginTop: 4,
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {transaction.note}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* INVALID TRANSACTIONS SECTION */}
                            {invalidRows.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#E74C3C' }}>
                                        ⚠ Invalid Transactions ({invalidRows.length})
                                    </Text>
                                    {invalidRows.map((row, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                borderLeftWidth: 3,
                                                borderLeftColor: '#E74C3C',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#f0f0f0',
                                                paddingVertical: 12,
                                                paddingHorizontal: 10,
                                                backgroundColor: '#FDE8E8',
                                            }}
                                        >
                                            <Text style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>
                                                Row {row.rowIndex}
                                            </Text>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, color: '#666' }}>
                                                    {row.date || '—'}
                                                </Text>
                                                <Text style={{ fontSize: 12, color: '#666', fontWeight: '600' }}>
                                                    {row.amount || '0.00'}
                                                </Text>
                                            </View>

                                            {row.categoryTag && (
                                                <View
                                                    style={{
                                                        backgroundColor: '#FFD4D4',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 3,
                                                        borderRadius: 4,
                                                        alignSelf: 'flex-start',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 11, color: '#C0392B' }}>
                                                        {row.categoryTag}
                                                    </Text>
                                                </View>
                                            )}

                                            {row.errors.map((error, errorIndex) => (
                                                <Text
                                                    key={errorIndex}
                                                    style={{
                                                        fontSize: 11,
                                                        color: '#E74C3C',
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    • {error}
                                                </Text>
                                            ))}

                                            {row.description && (
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                        color: '#999',
                                                        marginTop: 6,
                                                        fontStyle: 'italic',
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {row.description}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    )}

                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{
                                backgroundColor: '#4ECDC4',
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                ✓ Import All Transactions
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                backgroundColor: '#E8E8E8',
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
