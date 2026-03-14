import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { database } from '@/database';
import { CATEGORIES } from '@/constants/categories';
import { TRANSACTION_SECTIONS } from '@/data/transactions';
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
    const { importedData, importFromText, clearImportedData } = useCSVImport();
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

            // Read sample CSV data from embedded file
            const sampleCSV = `Date,Time,Transaction Details,Other Transaction Details (UPI ID or A/c No),Your Account,Amount,UPI Ref No.,Order ID,Remarks,Tags,Comment
31/12/2025,22:56:47,Paid to Meesho,paytm-17731298@ptybl on Paytm,Axis Bank - 48,-96.00,536527257257,,UPI Intent,#?? Shopping,
14/12/2025,12:10:56,Paid to Amman Stores Fruit and Vegitable,paytm.s1h8djf@pty on Paytm,Axis Bank - 48,-42.00,534852653080,,Milk keerai,#?? Groceries,
14/12/2025,12:00:49,Paid to Latha K,q308489988@ybl on PhonePe,Axis Bank - 48,-90.00,534812633838,,Milk curd potato ,#?? Groceries,
13/12/2025,17:44:04,Paid to Manikandan,paytm.s165eeq@pty on Paytm,Axis Bank - 48,-15.00,534761771577,,,#?? Taxi,
12/12/2025,20:06:46,Paid to Madhuram Siddha Ayurvedic Shop,q468961468@ybl on PhonePe,Axis Bank - 48,-122.00,534650658690,,,#?? Medical,
08/12/2025,20:04:26,Paid to Amman Stores Fruit and Vegitable,paytm.s1h8djf@pty on Paytm,Axis Bank - 48,-13.00,534235072361,,Soda,#?? Groceries,
08/12/2025,19:51:34,Paid to Durai Store,yespay.bizsbiz83532@yesbankltd,Axis Bank - 48,-53.00,534205114486,,Banana,#?? Groceries,
07/12/2025,18:35:50,Paid to Latha K,q308489988@ybl on PhonePe,Axis Bank - 48,-35.00,534103607752,,Flour,#?? Groceries,
06/12/2025,21:23:36,Paid to Oam Industries I Pvt Ltd,oamindustriesipvtltd.42659666@hdfcbank,Axis Bank - 48,-137.00,534052505636,,,#?? Food,
05/12/2025,15:07:06,Money sent to K Prakash,prakashjai8825@okhdfcbank on Google Pay,Axis Bank - 48,"-2,038.00",533960507650,,,#?? Money Transfer,
04/12/2025,21:13:30,Paid to Latha K,q308489988@ybl on PhonePe,Axis Bank - 48,-65.00,533809773129,,Flour curd lays ,#?? Groceries,
04/12/2025,16:08:42,Paid to Revathi P,ppr.05652.21092023.00196291@cnrb,Axis Bank - 48,-200.00,533879233430,,Grocery,#?? Food,
04/12/2025,16:04:44,Paid to Latha K,q308489988@ybl on PhonePe,Axis Bank - 48,-28.00,533859223245,,Boost milk,#?? Groceries,
03/12/2025,09:21:06,Bill Payment for Tamil Nadu Power (TNPDCL)  092452401817,paytm-ptmbbp@ptybl on Paytm,Axis Bank - 48,-376.00,533707347529,26292426697,,#?? Bill Payments,
03/12/2025,08:59:00,Money sent to Goshala Foods,goshalafoods2024@okhdfcbank on Google Pay,Axis Bank - 48,"-1,050.00",533757300745,,,#?? Money Transfer,
01/12/2025,19:44:28,Paid to Latha K,q308489988@ybl on PhonePe,Axis Bank - 48,-35.00,533652653080,,Flour,#?? Groceries,`;

            const success = importFromText(sampleCSV);
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
        // TODO: Implement file picker when ready
        // For now, showing placeholder
        Alert.alert('Coming Soon', 'File picker implementation deferred.');
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
