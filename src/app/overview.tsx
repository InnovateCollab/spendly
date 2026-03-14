import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ui/themed-view';
import { WebBadge } from '@/components/ui/web-badge';
import { OverviewStats } from '@/components/overview/overview-stats';
import { OverviewHeader } from '@/components/overview/overview-header';
import { CategoryBarChart } from '@/components/overview/category-bar-chart';
import { LabelsSection } from '@/components/overview/labels-section';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLayoutInsets } from '@/hooks/use-layout-insets';
import { useTransactionLoader } from '@/hooks/use-transaction-loader';
import { useDatabaseRefresh } from '@/contexts/database-context';
import { TRANSACTION_SECTIONS } from '@/data/transactions';
import { CategoryType } from '@/schemas';

const MONTHS = [
    { label: 'September 2025', value: 'September 2025' },
    { label: 'October 2025', value: 'October 2025' },
    { label: 'November 2025', value: 'November 2025' },
    { label: 'December 2025', value: 'December 2025' },
    { label: 'January 2026', value: 'January 2026' },
    { label: 'February 2026', value: 'February 2026' },
];

export default function OverviewScreen() {
    const theme = useTheme();
    const { insets, contentPlatformStyle } = useLayoutInsets();
    const { transactions: rawTransactions, loadTransactions } = useTransactionLoader();
    const { refreshTrigger } = useDatabaseRefresh();

    const [selectedCategoryType, setSelectedCategoryType] = useState<CategoryType>('expense');
    const [selectedMonth, setSelectedMonth] = useState('December 2025');
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Reload on database refresh (debug menu)
    useEffect(() => {
        console.log('Database refreshed - reloading transactions');
        loadTransactions();
    }, [refreshTrigger, loadTransactions]);

    // Calculate totals from current transactions
    let totalIncome = 0;
    let totalExpenses = 0;

    const transactions = Platform.OS === 'web'
        ? TRANSACTION_SECTIONS.flatMap(s => s.transactions)
        : rawTransactions;

    transactions.forEach(tx => {
        if (tx.amount > 0) {
            totalIncome += tx.amount;
        } else {
            totalExpenses += Math.abs(tx.amount);
        }
    });

    const monthlyCashFlow = totalIncome - totalExpenses;

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        >
            <ThemedView style={styles.container}>
                <OverviewHeader
                    totalCashFlow={monthlyCashFlow}
                    selectedMonth={selectedMonth}
                    months={MONTHS}
                    onMonthChange={setSelectedMonth}
                />

                <OverviewStats
                    totalIncome={totalIncome}
                    monthlyCashFlow={monthlyCashFlow}
                />

                <CategoryBarChart
                    transactions={transactions}
                    selectedType={selectedCategoryType}
                    onTypeChange={setSelectedCategoryType}
                    showAllCategories={showAllCategories}
                    onToggleAllCategories={() => setShowAllCategories(!showAllCategories)}
                />

                <LabelsSection transactions={transactions} />

                {Platform.OS === 'web' && <WebBadge />}
            </ThemedView>
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
});
