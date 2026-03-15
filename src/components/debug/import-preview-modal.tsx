import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { database } from '@/database';
import { CSVTransactionData, InvalidCSVRow } from '@/hooks/use-csv-import';
import { Category } from '@/schemas/category';

interface ImportPreviewModalProps {
    visible: boolean;
    importedData: CSVTransactionData[];
    invalidRows?: InvalidCSVRow[];
    onClose: () => void;
    onConfirm: () => void;
}

export function ImportPreviewModal({
    visible,
    importedData,
    invalidRows = [],
    onClose,
    onConfirm,
}: ImportPreviewModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
            console.error('Failed to load categories:', error);
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
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                        📋 Preview Imported Transactions
                    </Text>
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
                                                        ${transaction.amount.toFixed(2)}
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
                                                    ${row.amount || '0.00'}
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
