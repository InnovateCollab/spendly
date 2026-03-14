import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';

interface DebugMenuModalProps {
    visible: boolean;
    stats: { transactions: number; categories: number };
    onClose: () => void;
    onReset: () => void;
    onReseed: () => void;
    onImportCSV: () => void;
}

export function DebugMenuModal({
    visible,
    stats,
    onClose,
    onReset,
    onReseed,
    onImportCSV,
}: DebugMenuModalProps) {
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
                        maxHeight: '80%',
                    }}
                >
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                            🛠️ Database Debug Menu
                        </Text>
                    </View>

                    <ScrollView style={{ marginBottom: 20 }}>
                        {/* Stats Section */}
                        <View
                            style={{
                                backgroundColor: '#F5F5F5',
                                borderRadius: 12,
                                padding: 15,
                                marginBottom: 20,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                                📊 Database Stats
                            </Text>
                            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                                Transactions: {stats.transactions}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#666' }}>
                                Categories: {stats.categories}
                            </Text>
                        </View>

                        {/* Actions Section */}
                        <View style={{ gap: 10 }}>
                            <TouchableOpacity
                                onPress={onReset}
                                style={{
                                    backgroundColor: '#FF6B6B',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                    🗑️ Reset Database
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onReseed}
                                style={{
                                    backgroundColor: '#4ECDC4',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                    🌱 Reseed Data
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onImportCSV}
                                style={{
                                    backgroundColor: '#7B5DFF',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                    📥 Import CSV Data
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: '#E8E8E8',
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontWeight: '600', fontSize: 14 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
