/**
 * Category breakdown bar chart with table
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { CategoryType, Category } from '@/schemas';
import { Spacing } from '@/constants/theme';
import { COLORS, AMOUNT_CONFIG } from '@/constants/colors';
import { AmountDisplay } from '@/components/common/amount-display';
import { TypeToggleButton } from '@/components/common/type-toggle-button';

interface CategoryData {
    name: string;
    amount: number;
    absAmount: number;
    percentage: number;
    icon: SymbolViewProps['name'];
    color: string;
}

interface CategoryBarChartProps {
    transactions: any[];
    selectedType: CategoryType;
    onTypeChange: (type: CategoryType) => void;
    showAllCategories: boolean;
    onToggleAllCategories: () => void;
}

const isIncomeCategory = (category: Category): boolean => {
    return category.type === 'income';
};

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
    transactions,
    selectedType,
    onTypeChange,
    showAllCategories,
    onToggleAllCategories,
}) => {
    // Calculate category totals
    const categoryMap = new Map<string, { amount: number; icon: SymbolViewProps['name']; color: string }>();
    let colorIndex = 0;

    transactions.forEach((tx) => {
        const isIncome = isIncomeCategory(tx.category);
        if ((isIncome && selectedType === 'income') || (!isIncome && selectedType === 'expense')) {
            if (!categoryMap.has(tx.category.name)) {
                categoryMap.set(tx.category.name, {
                    amount: 0,
                    icon: tx.category.icon,
                    color: COLORS.chart[colorIndex % COLORS.chart.length],
                });
                colorIndex++;
            }
            const category = categoryMap.get(tx.category.name)!;
            category.amount += tx.amount;
        }
    });

    // Convert to array with percentages
    const categoryValues = Array.from(categoryMap.values()).map((cat) => Math.abs(cat.amount));
    const totalAmount = categoryValues.reduce((sum, val) => sum + val, 0);

    const categoryData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, { amount, icon, color }]) => {
            const absAmount = Math.abs(amount);
            return {
                name,
                amount: Math.round(amount * 100) / 100,
                absAmount: Math.round(absAmount * 100) / 100,
                percentage: totalAmount > 0 ? Math.round((absAmount / totalAmount) * 100) : 0,
                icon,
                color,
            };
        })
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    // Determine what to display
    const displayedCategories = showAllCategories ? categoryData : categoryData.slice(0, AMOUNT_CONFIG.displayLimit);
    const hasMoreCategories = categoryData.length > AMOUNT_CONFIG.displayLimit;

    return (
        <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Categories
            </ThemedText>

            <View style={styles.toggleButtons}>
                <TypeToggleButton
                    selected={selectedType}
                    onSelect={onTypeChange}
                    type="expense"
                    label="Expense"
                    icon={{ ios: 'arrow.up.circle.fill', android: 'trending_up', web: 'trending_up' }}
                    color={COLORS.expense}
                />
                <TypeToggleButton
                    selected={selectedType}
                    onSelect={onTypeChange}
                    type="income"
                    label="Income"
                    icon={{ ios: 'arrow.down.circle.fill', android: 'trending_down', web: 'trending_down' }}
                    color={COLORS.income}
                />
            </View>

            <View style={styles.barChartCard}>
                <View style={styles.barChartWrapper}>
                    <View style={styles.chartContainer}>
                        <View style={styles.barSegmentContainer}>
                            {categoryData.map((item, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.barSegment,
                                        {
                                            backgroundColor: item.color,
                                            width: `${item.percentage}%`,
                                        },
                                    ]}
                                >
                                    <ThemedText type="small" style={styles.barLabel} numberOfLines={1}>
                                        {item.percentage}%
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.categoriesTable}>
                        {displayedCategories.map((item, idx) => (
                            <View key={idx} style={styles.categoryRow}>
                                <View style={styles.categoryContent}>
                                    <SymbolView name={item.icon} size={24} tintColor={item.color} />
                                    <ThemedText type="small" style={styles.categoryName}>
                                        {item.name}
                                    </ThemedText>
                                </View>
                                <AmountDisplay amount={item.amount} style={styles.categoryAmount} />
                            </View>
                        ))}
                    </View>

                    {hasMoreCategories && (
                        <Pressable
                            style={({ pressed }) => [styles.showMoreButton, pressed && { opacity: 0.7 }]}
                            onPress={onToggleAllCategories}
                        >
                            <ThemedText type="small" style={styles.showMoreText}>
                                {showAllCategories ? 'Show Less' : `All Categories (${categoryData.length})`}
                            </ThemedText>
                        </Pressable>
                    )}
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: Spacing.four,
        gap: Spacing.two,
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
    barChartCard: {
        padding: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    barChartWrapper: {
        width: '100%',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.two,
        width: '100%',
    },
    barSegmentContainer: {
        width: 350,
        height: 80,
        flexDirection: 'row',
        borderRadius: Spacing.two,
        overflow: 'hidden',
        backgroundColor: COLORS.border,
    },
    barSegment: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minWidth: 25,
    },
    barLabel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
    },
    categoriesTable: {
        overflow: 'hidden',
        borderRadius: Spacing.two,
        backgroundColor: '#ffffff',
        marginTop: Spacing.two,
        width: '100%',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.two,
        minHeight: 48,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: Spacing.two,
        backgroundColor: '#ffffff',
    },
    categoryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    categoryName: {
        fontWeight: '600',
    },
    categoryAmount: {
        minWidth: 80,
        textAlign: 'right',
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
