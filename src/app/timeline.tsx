import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View, Pressable } from 'react-native';
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
import { useMonthNavigation } from '@/hooks/use-month-navigation';
import { useDatabaseRefresh } from '@/contexts/database-context';
import { AmountDisplay } from '@/components/common/amount-display';

export default function TimelineScreen() {
  const theme = useTheme();
  const { insets, contentPlatformStyle } = useLayoutInsets();
  const { currentMonth, previousMonth, nextMonth, panResponder } = useMonthNavigation();
  const { transactions: monthTransactions, loadTransactions } = useTransactionLoader(currentMonth);
  const { refreshTrigger } = useDatabaseRefresh();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionUI | undefined>(undefined);

  // Calculate total cash flow for the current month
  const totalCashFlow = useMemo(() => {
    return (monthTransactions as DailyTransactions[]).reduce((sum, day) => sum + day.totalAmount, 0);
  }, [monthTransactions]);

  const handleEditTransaction = (transaction: TransactionUI) => {
    setEditingTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(undefined);
  };

  const handleTransactionSuccess = () => {
    loadTransactions(currentMonth);
  };

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Timeline screen focused - reloading transactions');
      loadTransactions(currentMonth);
      return () => { };
    }, [loadTransactions, currentMonth])
  );

  // Reload on database refresh (debug menu)
  useEffect(() => {
    console.log('Database refreshed - reloading transactions');
    loadTransactions(currentMonth);
  }, [refreshTrigger, loadTransactions, currentMonth]);


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
              {Platform.OS === 'web' && (
                // Web: Month header with arrow navigation
                <View style={styles.headerMonthSection}>
                  <Pressable
                    style={styles.navButton}
                    onPress={previousMonth}
                  >
                    <ThemedText style={styles.navButtonText}>❮</ThemedText>
                  </Pressable>

                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText style={styles.monthHeader}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </ThemedText>
                  </View>

                  <Pressable
                    style={styles.navButton}
                    onPress={nextMonth}
                  >
                    <ThemedText style={styles.navButtonText}>❯</ThemedText>
                  </Pressable>
                </View>
              )}

              {Platform.OS !== 'web' && (
                // Mobile: Month header only (swipe navigation available)
                <ThemedText style={styles.monthHeader}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </ThemedText>
              )}

              <AmountDisplay
                amount={totalCashFlow}
                type="currency"
              />
              <View style={styles.headerLabel}>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                  Cash Flow
                </ThemedText>
              </View>
            </ThemedView>

            <ThemedView style={styles.sectionsWrapper}>
              {(monthTransactions as DailyTransactions[]).length > 0 ? (
                (monthTransactions as DailyTransactions[]).map((section, idx) => (
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
  headerMonthSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  navButton: {
    padding: Spacing.two,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '600',
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
