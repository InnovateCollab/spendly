import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { CATEGORIES } from '@/constants/categories';

interface ImportedTransaction {
    date: string;
    amount: string;
    category: string;
    description: string;
}

interface ImportPreviewModalProps {
    visible: boolean;
    importedData: ImportedTransaction[];
    onClose: () => void;
    onConfirm: () => void;
}

export function ImportPreviewModal({
    visible,
    importedData,
    onClose,
    onConfirm,
}: ImportPreviewModalProps) {
    const getCategoryColor = (category: string) => {
        const categoryKey = Object.keys(CATEGORIES).find(
            (key) => CATEGORIES[key as keyof typeof CATEGORIES].name.toLowerCase() === category.toLowerCase()
        );
        return categoryKey
            ? CATEGORIES[categoryKey as keyof typeof CATEGORIES].color
            : '#999999';
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
                        📋 Preview Imported Transactions ({importedData.length})
                    </Text>

                    <ScrollView style={{ flex: 1, marginBottom: 20 }}>
                        {importedData.map((transaction, index) => (
                            <View
                                key={index}
                                style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f0f0f0',
                                    paddingVertical: 12,
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
                                        {transaction.date}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#333',
                                        }}
                                    >
                                        ${Number(transaction.amount).toFixed(2)}
                                    </Text>
                                </View>

                                <View style={{ marginBottom: 4 }}>
                                    <View
                                        style={{
                                            backgroundColor: getCategoryColor(transaction.category),
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
                                            {transaction.category}
                                        </Text>
                                    </View>
                                </View>

                                {transaction.description && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: '#666',
                                            marginTop: 4,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {transaction.description}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>

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
