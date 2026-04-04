import { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Alert, Platform } from 'react-native';
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
    const [rawCsvText, setRawCsvText] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { importedData, invalidRows, importFromText, importFromFile, parseCSVDirect, parseCSVDirectWithFormat, clearImportedData, dateFormat, setDateFormat } = useCSVImport();
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
                setRawCsvText(SAMPLE_CSV); // Store raw CSV for re-parsing
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
        if (Platform.OS === 'web') {
            // On web, use HTML file input
            fileInputRef.current?.click();
        } else {
            // On native, use DocumentPicker
            try {
                setShowImportOptions(false);
                setIsLoadingFile(true);

                const DocumentPicker = await import('expo-document-picker');

                const result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    copyToCacheDirectory: true,
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

                // Get file content for re-parsing
                const fileContent = await (await import('expo-file-system')).readAsStringAsync(file.uri, { encoding: 'utf8' });
                setRawCsvText(fileContent); // Store raw CSV for re-parsing

                setIsLoadingFile(false);

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
    }

    async function handleWebFileChange(event: any) {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setShowImportOptions(false);
            setIsLoadingFile(true);

            // Read the file and parse it
            const fileContents = await file.text();
            const parseResult = parseCSVDirect(fileContents);

            setRawCsvText(fileContents); // Store raw CSV for re-parsing

            setIsLoadingFile(false);

            if ((parseResult.valid && parseResult.valid.length > 0) || parseResult.invalid.length > 0) {
                setShowImportPreview(true);
            } else {
                Alert.alert('No Data', 'The file could not be parsed.');
                setShowImportOptions(true);
            }

            // Reset input
            event.target.value = '';
        } catch (error: any) {
            setIsLoadingFile(false);
            const errorMessage = error.message || String(error).substring(0, 100);
            Alert.alert('Error', `Failed to read file: ${errorMessage}`);
            setShowImportOptions(true);
        }
    }

    async function handleReparseWithFormat(newFormat: string) {
        try {
            if (rawCsvText) {
                const parseResult = parseCSVDirectWithFormat(rawCsvText, newFormat);
                return parseResult;
            }
            return { valid: [], invalid: [] };
        } catch (error: any) {
            console.error('Failed to reparse CSV:', error);
            throw error;
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
                dateFormat={dateFormat}
                onDateFormatChange={setDateFormat}
                rawCsvText={rawCsvText}
                onReparseWithFormat={handleReparseWithFormat}
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

            {/* Hidden file input for web */}
            {Platform.OS === 'web' && (
                <input
                    ref={fileInputRef as any}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleWebFileChange}
                />
            )}
        </>
    );
}
