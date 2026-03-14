import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
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

  const [allTransactions, setAllTransactions] = useState<TransactionUI[]>([]);
  const [transactions, setTransactions] = useState<DailyTransactions[]>([]);
  const [totalCashFlow, setTotalCashFlow] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionUI | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Refs to store latest state values for use in event handlers
  const currentMonthRef = useRef(currentMonth);
  useEffect(() => {
    currentMonthRef.current = currentMonth;
  }, [currentMonth]);

  const allTransactionsRef = useRef(allTransactions);
  useEffect(() => {
    allTransactionsRef.current = allTransactions;
  }, [allTransactions]);

  // Filter transactions for a specific month
  const filterTransactionsByMonth = useCallback((txs: TransactionUI[], month: Date): TransactionUI[] => {
    return txs.filter(tx =>
      tx.date.getFullYear() === month.getFullYear() &&
      tx.date.getMonth() === month.getMonth()
    );
  }, []);

  // Handle swipe gestures - memoized with dependencies
  const handleSwipe = useCallback((
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const { dx } = gestureState;
    const SWIPE_THRESHOLD = 50;

    if (dx > SWIPE_THRESHOLD) {
      // Swiped right - go to previous month
      const newMonth = new Date(currentMonthRef.current.getFullYear(), currentMonthRef.current.getMonth() - 1, 1);
      const hasTransactions = allTransactionsRef.current.some(tx =>
        tx.date.getFullYear() === newMonth.getFullYear() &&
        tx.date.getMonth() === newMonth.getMonth()
      );
      if (hasTransactions) {
        setCurrentMonth(newMonth);
      }
    } else if (dx < -SWIPE_THRESHOLD) {
      // Swiped left - go to next month
      const newMonth = new Date(currentMonthRef.current.getFullYear(), currentMonthRef.current.getMonth() + 1, 1);
      const hasTransactions = allTransactionsRef.current.some(tx =>
        tx.date.getFullYear() === newMonth.getFullYear() &&
        tx.date.getMonth() === newMonth.getMonth()
      );
      if (hasTransactions) {
        setCurrentMonth(newMonth);
      }
    }
  }, []);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: handleSwipe,
  })).current;
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

  // Update transactions when rawTransactions or currentMonth changes
  useEffect(() => {
    setAllTransactions(rawTransactions);
    const monthTransactions = filterTransactionsByMonth(rawTransactions, currentMonth);
    const grouped = groupTransactionsByDate(monthTransactions);
    setTransactions(grouped);
    const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    setTotalCashFlow(total);
  }, [rawTransactions, currentMonth, filterTransactionsByMonth, groupTransactionsByDate]);

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
      <View style={styles.gestureContainer} {...panResponder.panHandlers}>
        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentInset={insets}
          contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
          scrollEnabled={true}
        >
          <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
              <ThemedText style={styles.monthHeader}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </ThemedText>
              <AmountDisplay amount={totalCashFlow} type="currency" />
              <View style={styles.headerLabel}>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                  Cash Flow
                </ThemedText>
              </View>
            </ThemedView>

            <ThemedView style={styles.sectionsWrapper}>
              {transactions.length > 0 ? (
                transactions.map((section, idx) => (
                  <TransactionSection key={idx} section={section} onEdit={handleEditTransaction} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText} themeColor="textSecondary">
                    No transactions for {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </ThemedText>
                </View>
              )}
            </ThemedView>

            {Platform.OS === 'web' && <WebBadge />}
          </ThemedView>
        </ScrollView>
      </View>

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
  gestureContainer: {
    flex: 1,
  },
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
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionsWrapper: {
    gap: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four * 2,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
