import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { database } from '@/database';
import { CATEGORIES } from '@/constants/categories';
import { TRANSACTION_SECTIONS } from '@/data/transactions';
import { useDatabaseRefresh } from '@/contexts/database-context';

export function DevMenu() {
    const [visible, setVisible] = useState(false);
    const [stats, setStats] = useState({ transactions: 0, categories: 0 });
    const { triggerRefresh } = useDatabaseRefresh();

    useEffect(() => {
        if (visible) {
            updateStats();
        }
    }, [visible]);

    async function updateStats() {
        const transactions = await database.getTransactions();
        setStats({
            transactions: transactions.length,
            categories: Object.keys(CATEGORIES).length,
        });
    }

    async function handleReset() {
        Alert.alert(
            'Reset Database',
            'Clear all transactions and categories?',
            [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    onPress: async () => {
                        try {
                            await database.clearTransactions();
                            await updateStats();
                            triggerRefresh(); // Notify pages of change
                            setVisible(false); // Auto-close to refresh pages
                            Alert.alert('Success', 'Database cleared');
                        } catch (error) {
                            Alert.alert('Error', String(error));
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    }

    async function handleReseed() {
        Alert.alert(
            'Reseed Database',
            'Clear all data and reseed with test data?',
            [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Reseed',
                    onPress: async () => {
                        try {
                            // Clear existing data
                            await database.clearTransactions();

                            // Reseed categories
                            for (const category of Object.values(CATEGORIES)) {
                                await database.insertCategory({
                                    name: category.name,
                                    icon: category.icon,
                                    color: category.color,
                                    type: category.type,
                                });
                            }

                            // Reseed transactions
                            const transactions = TRANSACTION_SECTIONS.flatMap(
                                section => section.transactions
                            );
                            for (const tx of transactions) {
                                await database.insertTransaction({
                                    categoryId: tx.category.id,
                                    amount: tx.amount,
                                    date: tx.date,
                                    note: tx.note,
                                    labels: tx.labels,
                                });
                            }

                            await updateStats();
                            triggerRefresh(); // Notify pages of change
                            setVisible(false); // Auto-close to refresh pages
                            Alert.alert('Success', `Reseeded ${transactions.length} transactions`);
                        } catch (error) {
                            Alert.alert('Error', String(error));
                        }
                    },
                    style: 'default',
                },
            ]
        );
    }

    return (
        <>
            {/* Floating Debug Button */}
            <TouchableOpacity
                onPress={() => setVisible(true)}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    right: 20,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999,
                }}
            >
                <Text style={{ fontSize: 20 }}>🛠️</Text>
            </TouchableOpacity>

            {/* Debug Menu Modal */}
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
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
                                    onPress={handleReset}
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
                                    onPress={handleReseed}
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
                            </View>
                        </ScrollView>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setVisible(false)}
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
        </>
    );
}
