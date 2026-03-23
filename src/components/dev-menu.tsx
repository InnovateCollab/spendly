import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '@/database';
import { CATEGORIES } from '@/constants/categories';
import { TRANSACTION_SECTIONS } from '@/data/seed-transactions';
import { SAMPLE_CSV } from '@/data/csv-import-sample';
import { useDatabaseRefresh } from '@/contexts/database-context';
import { useCSVImport } from '@/hooks/use-csv-import';
import { importTransactionsToDatabase } from '@/services/csv-import-service';
import { DebugMenuModal } from './debug/debug-menu-modal';
import { ImportPreviewModal } from './debug/import-preview-modal';
import { ImportOptionsModal } from './debug/import-options-modal';

export function DevMenu() {
    const [visible, setVisible] = useState(false);
    const [stats, setStats] = useState({ transactions: 0, categories: 0 });
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const { importedData, invalidRows, importFromText, importFromFile, clearImportedData } = useCSVImport();
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

    async function handleImportCSV() {
        setShowImportOptions(true);
        setVisible(false);
    }

    async function handleLoadSampleCSV() {
        try {
            setShowImportOptions(false);

            const success = importFromText(SAMPLE_CSV);
            if (success) {
                setShowImportPreview(true);
            }
        } catch (error: any) {
            Alert.alert('Error', `Failed to load sample CSV: ${String(error).substring(0, 100)}`);
        }
    }

    async function handleConfirmImport() {
        try {
            if (importedData.length === 0) {
                Alert.alert('No Data', 'No transactions to import.');
                return;
            }

            const { successCount, failureCount } = await importTransactionsToDatabase(importedData);

            // Clear imported data and refresh
            clearImportedData();
            setShowImportPreview(false);
            triggerRefresh();
            updateStats();

            Alert.alert(
                'Import Complete',
                `Imported: ${successCount} transactions${failureCount > 0 ? `, Failed: ${failureCount}` : ''}`
            );
        } catch (error: any) {
            Alert.alert('Error', `Import failed: ${String(error).substring(0, 100)}`);
        }
    }

    async function handlePickCSVFile() {
        try {
            setShowImportOptions(false);
            setIsLoadingFile(true);

            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.canceled) {
                setIsLoadingFile(false);
                setShowImportOptions(true);
                return;
            }

            if (!result.assets || result.assets.length === 0) {
                setIsLoadingFile(false);
                setShowImportOptions(true);
                return;
            }

            const file = result.assets[0];
            const parseResult = await importFromFile(file.uri);
            setIsLoadingFile(false);

            // show preview if there are valid transactions OR invalid rows to display
            if ((parseResult.valid && parseResult.valid.length > 0) || parseResult.invalid.length > 0) {
                setShowImportPreview(true);
            } else {
                Alert.alert('No Data', 'The file could not be parsed.');
                setShowImportOptions(true);
            }
        } catch (error: any) {
            setIsLoadingFile(false);

            if (error.name === 'PickerCanceledError' || error.message === 'User cancelled document picker') {
                setShowImportOptions(true);
            } else {
                Alert.alert('Error', `${error.message || String(error).substring(0, 100)}`);
                setShowImportOptions(true);
            }
        }
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
            <DebugMenuModal
                visible={visible}
                stats={stats}
                onClose={() => setVisible(false)}
                onReset={handleReset}
                onReseed={handleReseed}
                onImportCSV={handleImportCSV}
            />


            {/* Import Modals */}
            <ImportPreviewModal
                visible={showImportPreview}
                importedData={importedData}
                invalidRows={invalidRows}
                onClose={() => {
                    clearImportedData();
                    setShowImportPreview(false);
                }}
                onConfirm={handleConfirmImport}
            />

            <ImportOptionsModal
                visible={showImportOptions}
                onLoadSample={handleLoadSampleCSV}
                onPickFile={handlePickCSVFile}
                onClose={() => setShowImportOptions(false)}
            />
        </>
    );
}
