import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/formatting';
import { TRANSACTION_SECTIONS } from '@/data/transactions';

// Helper function to determine if category is income or expense
const isIncomeCategory = (category: string): boolean => {
    const incomeCategories = ['Salary', 'Freelance', 'Bonus', 'Investment', 'Refund'];
    return incomeCategories.includes(category);
};

// Labels Section Component
const LabelsSection = () => {
    const [selectedType, setSelectedType] = React.useState<'income' | 'expense'>('expense');

    // Calculate label totals from transactions
    const labelMap = new Map<string, { amount: number; count: number }>();

    TRANSACTION_SECTIONS.forEach(section => {
        section.transactions.forEach(tx => {
            const isIncome = isIncomeCategory(tx.category);
            if ((isIncome && selectedType === 'income') || (!isIncome && selectedType === 'expense')) {
                if (tx.labels) {
                    tx.labels.forEach(label => {
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
    });

    // Convert to array and sort by amount descending (use absolute value for sorting)
    const labelsData = Array.from(labelMap.entries())
        .map(([name, { amount, count }]) => ({
            name,
            amount: Math.round(amount * 100) / 100,
            count,
        }))
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    return (
        <ThemedView style={styles.labelsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitleCenter}>
                Labels
            </ThemedText>

            <View style={styles.labelTypeButtons}>
                <Pressable
                    style={({ pressed }) => [
                        styles.labelTypeButton,
                        selectedType === 'expense' && styles.labelTypeButtonActive,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setSelectedType('expense')}
                >
                    <ThemedView
                        type={selectedType === 'expense' ? 'backgroundSelected' : 'backgroundElement'}
                        style={styles.labelTypeButtonContent}
                    >
                        <SymbolView
                            tintColor="#FF6B6B"
                            name={{ ios: 'arrow.up.circle.fill', android: 'trending_up', web: 'trending_up' }}
                            size={18}
                        />
                        <ThemedText type="small">Expense</ThemedText>
                    </ThemedView>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.labelTypeButton,
                        selectedType === 'income' && styles.labelTypeButtonActive,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setSelectedType('income')}
                >
                    <ThemedView
                        type={selectedType === 'income' ? 'backgroundSelected' : 'backgroundElement'}
                        style={styles.labelTypeButtonContent}
                    >
                        <SymbolView
                            tintColor="#4ECDC4"
                            name={{ ios: 'arrow.down.circle.fill', android: 'trending_down', web: 'trending_down' }}
                            size={18}
                        />
                        <ThemedText type="small">Income</ThemedText>
                    </ThemedView>
                </Pressable>
            </View>

            <View style={styles.labelsTable}>
                {labelsData.map((label, idx) => (
                    <View key={idx} style={styles.labelRow}>
                        <View style={styles.labelContent}>
                            <ThemedText type="small" style={styles.labelName}>
                                {label.name}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                                {label.count} transaction{label.count > 1 ? 's' : ''}
                            </ThemedText>
                        </View>
                        <ThemedText type="small" style={styles.labelAmount}>
                            {formatCurrency(Math.abs(label.amount))}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
};

// Simple Pie Chart Component
const CategoryPieChart = ({ selectedType }: { selectedType: 'income' | 'expense' }) => {
    // Calculate category totals from transactions
    const categoryMap = new Map<string, { amount: number; color: string }>();
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
    let colorIndex = 0;

    TRANSACTION_SECTIONS.forEach(section => {
        section.transactions.forEach(tx => {
            const isIncome = isIncomeCategory(tx.category);
            if ((isIncome && selectedType === 'income') || (!isIncome && selectedType === 'expense')) {
                if (!categoryMap.has(tx.category)) {
                    categoryMap.set(tx.category, { amount: 0, color: colors[colorIndex % colors.length] });
                    colorIndex++;
                }
                const category = categoryMap.get(tx.category)!;
                category.amount += tx.amount;
            }
        });
    });

    // Convert to array and calculate percentages using absolute values
    const categoryValues = Array.from(categoryMap.values()).map(cat => Math.abs(cat.amount));
    const totalAmount = categoryValues.reduce((sum, val) => sum + val, 0);

    const categoryData = Array.from(categoryMap.entries())
        .map(([name, { amount, color }]) => {
            const absAmount = Math.abs(amount);
            return {
                name,
                amount: Math.round(absAmount * 100) / 100,
                percentage: totalAmount > 0 ? Math.round((absAmount / totalAmount) * 100) : 0,
                color,
            };
        })
        .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    return (
        <View style={styles.pieChartWrapper}>
            <View style={styles.chartContainer}>
                <View style={styles.pieSegmentContainer}>
                    {categoryData.map((item, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.pieSegment,
                                {
                                    backgroundColor: item.color,
                                    width: `${item.percentage}%`,
                                },
                            ]}
                        >
                            <ThemedText type="small" style={styles.pieLabel}>
                                {item.percentage}%
                            </ThemedText>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.categoriesTable}>
                {categoryData.map((item, idx) => (
                    <View key={idx} style={styles.categoryRow}>
                        <View style={styles.categoryContent}>
                            <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
                            <ThemedText type="small" style={styles.categoryName}>{item.name}</ThemedText>
                        </View>
                        <ThemedText type="small" style={styles.categoryAmount}>
                            {formatCurrency(item.amount)}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function OverviewScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();
    const [selectedCategoryType, setSelectedCategoryType] = React.useState<'income' | 'expense'>('expense');
    const [selectedMonth, setSelectedMonth] = React.useState<string>('December 2025');

    const months = [
        { label: 'September 2025', value: 'September 2025' },
        { label: 'October 2025', value: 'October 2025' },
        { label: 'November 2025', value: 'November 2025' },
        { label: 'December 2025', value: 'December 2025' },
        { label: 'January 2026', value: 'January 2026' },
        { label: 'February 2026', value: 'February 2026' },
    ];

    // Calculate totals from transactions
    let totalIncome = 0;
    let totalExpenses = 0;

    TRANSACTION_SECTIONS.forEach(section => {
        section.transactions.forEach(tx => {
            if (tx.amount > 0) {
                totalIncome += tx.amount;
            } else {
                totalExpenses += Math.abs(tx.amount);
            }
        });
    });

    const monthlyCashFlow = totalIncome - totalExpenses;

    const contentPlatformStyle = Platform.select({
        android: {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
        },
        web: {
            paddingTop: Spacing.six,
            paddingBottom: Spacing.four,
        },
    });

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="subtitle" style={styles.sectionTitleCenter}>
                        Overview
                    </ThemedText>
                    <View style={styles.monthScrollContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthList}
                            snapToInterval={145}
                            decelerationRate="fast"
                        >
                            {months.map((month) => (
                                <Pressable
                                    key={month.value}
                                    onPress={() => setSelectedMonth(month.value)}
                                    style={({ pressed }) => [
                                        styles.monthButton,
                                        selectedMonth === month.value && styles.monthButtonActive,
                                        pressed && { opacity: 0.7 },
                                    ]}
                                >
                                    <ThemedView
                                        type={selectedMonth === month.value ? 'backgroundSelected' : 'backgroundElement'}
                                        style={styles.monthButtonContent}
                                    >
                                        <ThemedText
                                            type="small"
                                            numberOfLines={1}
                                            style={selectedMonth === month.value ? styles.monthButtonTextActive : undefined}
                                        >
                                            {month.label}
                                        </ThemedText>
                                    </ThemedView>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </ThemedView>

                <ThemedView style={styles.statsWrapper}>
                    <ThemedView type="backgroundElement" style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <SymbolView
                                tintColor={theme.text}
                                name={{ ios: 'arrow.up.circle.fill', android: 'trending_up', web: 'trending_up' }}
                                size={16}
                            />
                        </View>
                        <View style={styles.statContent}>
                            <ThemedText type="small" themeColor="textSecondary">
                                Total Wealth
                            </ThemedText>
                            <ThemedText type="smallBold">{formatCurrency(totalIncome)}</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView type="backgroundElement" style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <SymbolView
                                tintColor={theme.text}
                                name={{ ios: 'arrow.down.circle.fill', android: 'trending_down', web: 'trending_down' }}
                                size={16}
                            />
                        </View>
                        <View style={styles.statContent}>
                            <ThemedText type="small" themeColor="textSecondary">
                                Monthly Cash Flow
                            </ThemedText>
                            <ThemedText type="smallBold">{formatCurrency(monthlyCashFlow)}</ThemedText>
                        </View>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.categoriesSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitleCenter}>
                        Categories
                    </ThemedText>

                    <View style={styles.labelTypeButtons}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.labelTypeButton,
                                selectedCategoryType === 'expense' && styles.labelTypeButtonActive,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={() => setSelectedCategoryType('expense')}
                        >
                            <ThemedView
                                type={selectedCategoryType === 'expense' ? 'backgroundSelected' : 'backgroundElement'}
                                style={styles.labelTypeButtonContent}
                            >
                                <SymbolView
                                    tintColor="#FF6B6B"
                                    name={{ ios: 'arrow.up.circle.fill', android: 'trending_up', web: 'trending_up' }}
                                    size={18}
                                />
                                <ThemedText type="small">Expense</ThemedText>
                            </ThemedView>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.labelTypeButton,
                                selectedCategoryType === 'income' && styles.labelTypeButtonActive,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={() => setSelectedCategoryType('income')}
                        >
                            <ThemedView
                                type={selectedCategoryType === 'income' ? 'backgroundSelected' : 'backgroundElement'}
                                style={styles.labelTypeButtonContent}
                            >
                                <SymbolView
                                    tintColor="#4ECDC4"
                                    name={{ ios: 'arrow.down.circle.fill', android: 'trending_down', web: 'trending_down' }}
                                    size={18}
                                />
                                <ThemedText type="small">Income</ThemedText>
                            </ThemedView>
                        </Pressable>
                    </View>

                    <View style={styles.pieChartCard}>
                        <CategoryPieChart selectedType={selectedCategoryType} />
                    </View>
                </ThemedView>

                <LabelsSection />

                {Platform.OS === 'web' && <WebBadge />}
            </ThemedView>

            <Pressable style={styles.fab} onPress={() => { /* TODO: handle add action */ }}>
                <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={28}
                    tintColor="#fff"
                />
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        maxWidth: MaxContentWidth,
        flexGrow: 1,
    },
    titleContainer: {
        gap: Spacing.half,
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
    },
    centerText: {
        textAlign: 'center',
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.one,
        gap: Spacing.two,
    },
    statsWrapper: {
        gap: Spacing.two,
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.three,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        padding: Spacing.two,
        borderRadius: Spacing.two,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    categoriesSection: {
        paddingHorizontal: Spacing.four,
        gap: Spacing.two,
    },
    labelsSection: {
        paddingHorizontal: Spacing.four,
        gap: Spacing.two,
        paddingTop: Spacing.three,
    },
    sectionTitle: {
        paddingTop: Spacing.two,
    },
    sectionTitleCenter: {
        paddingTop: Spacing.two,
        textAlign: 'center',
    },
    labelTypeButtons: {
        flexDirection: 'row',
        gap: Spacing.two,
        paddingVertical: Spacing.two,
    },
    labelTypeButton: {
        flex: 1,
    },
    labelTypeButtonActive: {
        opacity: 1,
    },
    labelTypeButtonContent: {
        padding: Spacing.two,
        borderRadius: Spacing.two,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.one,
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
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        minHeight: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: Spacing.two,
        backgroundColor: '#ffffff',
    },
    labelContent: {
        flex: 1,
        gap: Spacing.half,
    },
    labelName: {
        fontWeight: '600',
    },
    labelAmount: {
        fontWeight: '600',
        minWidth: 80,
        textAlign: 'right',
    },
    pieChartCard: {
        padding: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    pieChartWrapper: {
        width: '100%',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.two,
        width: '100%',
    },
    pieSegmentContainer: {
        width: 280,
        height: 80,
        flexDirection: 'row',
        borderRadius: Spacing.two,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    pieSegment: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    pieLabel: {
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
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        minHeight: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: Spacing.two,
        backgroundColor: '#ffffff',
    },
    categoryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    categoryColorDot: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    categoryName: {
        fontWeight: '600',
    },
    categoryAmount: {
        fontWeight: '600',
        minWidth: 80,
        textAlign: 'right',
    },
    fab: {
        position: 'absolute',
        bottom: Spacing.four,
        right: Spacing.four,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    monthList: {
        gap: Spacing.two,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.one,
        minWidth: '100%',
    },
    monthScrollContainer: {
        flex: 1,
        marginHorizontal: -Spacing.four,
    },
    monthButton: {
        marginHorizontal: Spacing.one,
        width: 135,
        flexShrink: 0,
    },
    monthButtonActive: {
        opacity: 1,
    },
    monthButtonContent: {
        paddingVertical: Spacing.one,
        paddingHorizontal: Spacing.one,
        borderRadius: Spacing.two,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    monthButtonTextActive: {
        fontWeight: '600',
    },
});
