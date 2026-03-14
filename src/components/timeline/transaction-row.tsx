/**
 * Displays a single transaction row with icon, category, amount, and labels
 */

import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { TransactionUI } from '@/schemas/transaction';
import { formatTransactionAmount } from '@/utils/formatting';
import { Spacing } from '@/constants/theme';
import { COLORS } from '@/constants/colors';
import { AmountDisplay } from '@/components/common/amount-display';

interface TransactionRowProps {
    transaction: TransactionUI;
    onEdit: (transaction: TransactionUI) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onEdit }) => {
    const theme = useTheme();
    const category = transaction.category;

    if (!category) {
        console.warn(`Category not found for transaction`);
        return null;
    }

    return (
        <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => onEdit(transaction)}
        >
            <SymbolView
                name={category.icon}
                size={28}
                tintColor={category.color || theme.textSecondary}
                style={styles.icon}
            />
            <View style={styles.content}>
                <View style={styles.mainLine}>
                    <ThemedText type="default" style={styles.description}>
                        {category.name}
                    </ThemedText>
                    <AmountDisplay amount={transaction.amount} style={styles.amount} />
                </View>

                {transaction.labels && transaction.labels.length > 0 && (
                    <View style={styles.labelsBadge}>
                        {transaction.labels.map((label, idx) => (
                            <View key={idx} style={styles.labelBadge}>
                                <ThemedText type="small" style={styles.labelText}>
                                    {label}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                )}

                {transaction.note && (
                    <ThemedText type="small" themeColor="text" style={styles.note}>
                        {transaction.note}
                    </ThemedText>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.one,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: '#ffffff',
        gap: Spacing.two,
    },
    icon: {
        marginTop: 2,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    mainLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    description: {
        flex: 1,
    },
    amount: {
        textAlign: 'right',
        marginLeft: Spacing.two,
    },
    labelsBadge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.one,
    },
    labelBadge: {
        backgroundColor: COLORS.label,
        borderRadius: 10,
        paddingHorizontal: Spacing.one * 1.5,
        paddingVertical: 0,
    },
    labelText: {
        fontSize: 9,
        fontWeight: '500',
    },
    note: {
        fontSize: 11,
        opacity: 0.7,
    },
});
