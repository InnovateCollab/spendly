import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Platform, FlatList } from 'react-native';
import { MaxContentWidth } from '@/constants/theme';
import { database } from '@/database';
import { ImportTransactionData, InvalidImportRow, ImportResult } from '@/hooks/use-csv-import';
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
}: ImportPreviewModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFormatPicker, setShowFormatPicker] = useState(false);
    const [isReparsing, setIsReparsing] = useState(false);

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
