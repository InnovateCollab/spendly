/**
 * Displays a group of transactions for a single date
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { DailyTransactions, TransactionUI } from '@/schemas/transaction';
import { formatDate, formatTransactionAmount } from '@/utils/formatting';
import { Spacing } from '@/constants/theme';
import { COLORS } from '@/constants/colors';
import { TransactionRow } from './transaction-row';

interface TransactionSectionProps {
    section: DailyTransactions;
    onEdit: (transaction: TransactionUI) => void;
}

export const TransactionSection: React.FC<TransactionSectionProps> = ({ section, onEdit }) => {
    const formattedDate = formatDate(section.date);

    return (
        <ThemedView type="backgroundElement" style={styles.section}>
            <View style={styles.dateHeader}>
                <ThemedText type="default">{formattedDate}</ThemedText>
                <ThemedText type="default">{formatTransactionAmount(section.totalAmount)}</ThemedText>
            </View>
            <View style={styles.table}>
                {section.transactions.map((tx, idx) => (
                    <TransactionRow key={idx} transaction={tx} onEdit={onEdit} />
                ))}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: 0,
        gap: 0,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.one * 2,
        backgroundColor: COLORS.border,
    },
    table: {
        overflow: 'hidden',
    },
});
