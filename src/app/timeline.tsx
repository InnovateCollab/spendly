import React, { useEffect, useState, useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { WebBadge } from '@/components/ui/web-badge';
import { AddTransactionModal } from '@/components/modals/add-transaction-modal';
import { TransactionSection } from '@/components/timeline/transaction-section';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { type TransactionUI, type DailyTransactions } from '@/schemas/transaction';
import { useTheme } from '@/hooks/use-theme';
import { useLayoutInsets } from '@/hooks/use-layout-insets';
import { useTransactionLoader } from '@/hooks/use-transaction-loader';
import { useDatabaseRefresh } from '@/contexts/database-context';
import { AmountDisplay } from '@/components/common/amount-display';

export default function TimelineScreen() {
  const theme = useTheme();
  const { insets, contentPlatformStyle } = useLayoutInsets();
  const { transactions: rawTransactions, loadTransactions } = useTransactionLoader();
  const { refreshTrigger } = useDatabaseRefresh();

  const [transactions, setTransactions] = useState<DailyTransactions[]>([]);
  const [totalCashFlow, setTotalCashFlow] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionUI | undefined>(undefined);

  // Group transactions by date
  const groupTransactionsByDate = useCallback((txs: TransactionUI[]): DailyTransactions[] => {
    const groups = new Map<string, TransactionUI[]>();

    for (const tx of txs) {
      const dateKey = tx.date.toISOString().split('T')[0];
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(tx);
    }

    return Array.from(groups.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([dateStr, txs]) => ({
        date: new Date(dateStr),
        totalAmount: txs.reduce((sum, t) => sum + t.amount, 0),
        transactions: txs,
      }));
  }, []);

  // Update local state when transactions load
  useEffect(() => {
    const grouped = groupTransactionsByDate(rawTransactions);
    setTransactions(grouped);
    const total = rawTransactions.reduce((sum, t) => sum + t.amount, 0);
    setTotalCashFlow(total);
  }, [rawTransactions, groupTransactionsByDate]);

  const handleEditTransaction = (transaction: TransactionUI) => {
    setEditingTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(undefined);
  };

  const handleTransactionSuccess = () => {
    loadTransactions();
  };

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Timeline screen focused - reloading transactions');
      loadTransactions();
      return () => { };
    }, [loadTransactions])
  );

  // Reload on database refresh (debug menu)
  useEffect(() => {
    console.log('Database refreshed - reloading transactions');
    loadTransactions();
  }, [refreshTrigger, loadTransactions]);


  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <AmountDisplay amount={totalCashFlow} type="currency" />
            <View style={styles.headerLabel}>
              <ThemedText style={styles.centerText} themeColor="textSecondary">
                Cash Flow
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            {transactions.map((section, idx) => (
              <TransactionSection key={idx} section={section} onEdit={handleEditTransaction} />
            ))}
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ThemedView>
      </ScrollView>

      <AddTransactionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSuccess={handleTransactionSuccess}
        editTransaction={editingTransaction}
      />
    </>
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
  header: {
    gap: Spacing.half,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  sectionsWrapper: {
    gap: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
  },
});
