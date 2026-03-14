/**
 * Labels section showing transaction labels breakdown
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { CategoryType } from '@/schemas';
import { Spacing } from '@/constants/theme';
import { COLORS, AMOUNT_CONFIG } from '@/constants/colors';
import { AmountDisplay } from '@/components/common/amount-display';
import { TypeToggleButton } from '@/components/common/type-toggle-button';

interface LabelData {
    name: string;
    amount: number;
    count: number;
}

interface LabelsProps {
    transactions: any[];
}

const isIncomeCategory = (category: any): boolean => {
    return category.type === 'income';
};

export const LabelsSection: React.FC<LabelsProps> = ({ transactions }) => {
    const [selectedType, setSelectedType] = React.useState<CategoryType>('expense');
    const [showAllLabels, setShowAllLabels] = React.useState(false);

    // Calculate label totals
    const labelMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach((tx) => {
        const isIncome = isIncomeCategory(tx.category);
        if ((isIncome && selectedType === 'income') || (!isIncome && selectedType === 'expense')) {
            if (tx.labels) {
                tx.labels.forEach((label: string) => {
                    if (!labelMap.has(label)) {
                        labelMap.set(label, { amount: 0, count: 0 });
                    }
                    const labelData = labelMap.get(label)!;
                    labelData.amount += tx.amount;
                    labelData.count += 1;
                });
            }
        }
    });

    // Convert to array and sort
    const labelsData: LabelData[] = Array.from(labelMap.entries())
        .map(([name, { amount, count }]) => ({
            name,
            amount: Math.round(amount * 100) / 100,
            count,
        }))
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    // Determine what to display
    const displayedLabels = showAllLabels ? labelsData : labelsData.slice(0, AMOUNT_CONFIG.displayLimit);
    const hasMoreLabels = labelsData.length > AMOUNT_CONFIG.displayLimit;

    return (
        <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Labels
            </ThemedText>

            <View style={styles.toggleButtons}>
                <TypeToggleButton
                    selected={selectedType}
                    onSelect={setSelectedType}
                    type="expense"
                    label="Expense"
                    icon={{ ios: 'arrow.up.circle.fill', android: 'trending_up', web: 'trending_up' }}
                    color={COLORS.expense}
                />
                <TypeToggleButton
                    selected={selectedType}
                    onSelect={setSelectedType}
                    type="income"
                    label="Income"
                    icon={{ ios: 'arrow.down.circle.fill', android: 'trending_down', web: 'trending_down' }}
                    color={COLORS.income}
                />
            </View>

            <View style={styles.labelsTable}>
                {displayedLabels.map((label, idx) => (
                    <View key={idx} style={styles.labelRow}>
                        <View style={styles.labelContent}>
                            <View style={styles.labelHeaderRow}>
                                <SymbolView
                                    tintColor={COLORS.icon}
                                    name={{ ios: 'tag.fill', android: 'local_offer', web: 'local_offer' }}
                                    size={24}
                                />
                                <View style={styles.labelTextContent}>
                                    <ThemedText type="small" style={styles.labelName}>
                                        {label.name}
                                    </ThemedText>
                                    <ThemedText type="small" themeColor="textSecondary">
                                        {label.count} transaction{label.count > 1 ? 's' : ''}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                        <AmountDisplay amount={label.amount} />
                    </View>
                ))}
            </View>

            {hasMoreLabels && (
                <Pressable
                    style={({ pressed }) => [styles.showMoreButton, pressed && { opacity: 0.7 }]}
                    onPress={() => setShowAllLabels(!showAllLabels)}
                >
                    <ThemedText type="small" style={styles.showMoreText}>
                        {showAllLabels ? 'Show Less' : `All Labels (${labelsData.length})`}
                    </ThemedText>
                </Pressable>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: Spacing.four,
        gap: Spacing.two,
        paddingTop: Spacing.three,
        marginHorizontal: Spacing.one,
    },
    sectionTitle: {
        paddingTop: Spacing.two,
        textAlign: 'center',
    },
    toggleButtons: {
        flexDirection: 'row',
        gap: 0,
        paddingVertical: Spacing.two,
    },
    labelsTable: {
        overflow: 'hidden',
        borderRadius: Spacing.two,
        backgroundColor: '#ffffff',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        minHeight: 48,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: Spacing.two,
        backgroundColor: '#ffffff',
    },
    labelContent: {
        flex: 1,
        gap: Spacing.half,
    },
    labelHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.one,
    },
    labelTextContent: {
        flexDirection: 'column',
        gap: Spacing.half,
        flex: 1,
    },
    labelName: {
        fontWeight: '600',
    },
    showMoreButton: {
        alignSelf: 'center',
        marginTop: Spacing.three,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        borderRadius: Spacing.two,
        backgroundColor: COLORS.border,
    },
    showMoreText: {
        fontWeight: '600',
        textAlign: 'center',
        color: '#007AFF',
    },
});
