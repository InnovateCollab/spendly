import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { database } from '@/database';
import { type TransactionUI, type DailyTransactions } from '@/schemas/transaction';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatDate, formatTransactionAmount } from '@/utils/formatting';

// Components
interface TransactionRowProps {
  transaction: TransactionUI;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const theme = useTheme();
  const category = transaction.category;

  if (!category) {
    console.warn(`Category not found: ${transaction.category?.name || transaction.category}`);
    return null;
  }

  return (
    <View style={styles.tableRow}>
      <SymbolView
        name={category.icon}
        size={28}
        tintColor={category.color || theme.textSecondary}
        style={styles.rowIcon}
      />
      <View style={styles.rowContent}>
        <View style={styles.rowMainLine}>
          <ThemedText type="default" style={styles.rowDescription}>
            {category.name}
          </ThemedText>
          <ThemedText
            type="default"
            style={[
              styles.amountCell,
              transaction.amount >= 0 ? styles.amountIncome : styles.amountExpense
            ]}
          >
            {formatTransactionAmount(transaction.amount)}
          </ThemedText>
        </View>
        {transaction.labels && transaction.labels.length > 0 && (
          <View style={styles.labelsBadge}>
            {transaction.labels.map((lbl, idx) => (
              <View key={idx} style={styles.labelBadge}>
                <ThemedText type="small" style={styles.rowLabel}>
                  {lbl}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
        {transaction.note && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.rowNote}>
            {transaction.note}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

interface TransactionSectionProps {
  section: DailyTransactions;
}

const TransactionSection: React.FC<TransactionSectionProps> = ({ section }) => {
  const formattedDate = formatDate(section.date);

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <View style={styles.dateHeader}>
        <ThemedText type="default">{formattedDate}</ThemedText>
        <ThemedText type="default">{formatTransactionAmount(section.totalAmount)}</ThemedText>
      </View>
      <View style={styles.table}>
        {section.transactions.map((tx, idx) => (
          <TransactionRow key={idx} transaction={tx} />
        ))}
      </View>
    </ThemedView>
  );
};

// Data - will be replaced with a version that gets data from database
// Currently fetching from SQLite database

export default function TimelineScreen() {
  const [transactions, setTransactions] = useState<DailyTransactions[]>([]);
  const [totalCashFlow, setTotalCashFlow] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for database to initialize before loading transactions
    const timer = setTimeout(() => {
      loadTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const loadTransactions = async () => {
    try {
      const dbTransactions = await database.getTransactionsWithCategories();
      const grouped = groupTransactionsByDate(dbTransactions);
      setTransactions(grouped);

      const total = dbTransactions.reduce((sum, t) => sum + t.amount, 0);
      setTotalCashFlow(total);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Retry if database not ready
      if (error instanceof Error && error.message.includes('not connected')) {
        setTimeout(loadTransactions, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const groupTransactionsByDate = (txs: TransactionUI[]): DailyTransactions[] => {
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
  };

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

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
          <ThemedText type="subtitle">{formatCurrency(totalCashFlow)}</ThemedText>
          <View style={styles.timelineRow}>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Cash Flow
            </ThemedText>
          </View>
        </ThemedView>

        <Pressable style={({ pressed }) => [styles.buttonSection, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.buttonWrapper}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' }}
              size={28}
            />
            <ThemedText type="small" style={styles.buttonText}>
              Spending Overview
            </ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedView style={styles.sectionsWrapper}>
          {transactions.map((section, idx) => (
            <TransactionSection key={idx} section={section} />
          ))}
        </ThemedView>

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
  titleContainer: {
    gap: Spacing.half,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  buttonSection: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonWrapper: {
    padding: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  buttonText: {
    marginLeft: Spacing.one,
  },
  sectionsWrapper: {
    gap: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
  },
  section: {
    padding: 0,
    gap: 0,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four, // Increased horizontal padding
    paddingVertical: Spacing.one * 2, // Increased vertical padding for more height
    backgroundColor: '#f0f0f0',
    marginBottom: 0,
  },
  table: {
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    gap: Spacing.two,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowMainLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowDescription: {
    flex: 1,
  },
  labelsBadge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: 2,
  },
  labelBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    paddingHorizontal: Spacing.one * 1.5,
    paddingVertical: 0,
  },
  rowLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  rowNote: {
    fontSize: 11,
    opacity: 0.7,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
  },
  amountCell: {
    textAlign: 'right',
    marginLeft: Spacing.two,
  },
  amountIncome: {
    color: '#22c55e',
  },
  amountExpense: {
    color: '#ef4444',
  },
  fab: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    backgroundColor: '#22c55e',
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
});
