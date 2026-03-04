import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AboutScreen() {
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
      scrollEnabled={true}
      nestedScrollEnabled={true}>
      <ThemedView style={styles.container}>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">€645</ThemedText>
          <View style={styles.timelineRow}>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Cash Flow
            </ThemedText>
            <Pressable style={styles.addButton} onPress={() => { /* TODO: handle add action */ }}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={22}
                tintColor="#fff"
              />
            </Pressable>
          </View>
        </ThemedView>

        <Pressable style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.buttonSection}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' }}
              size={20}
            />
            <ThemedText type="small" style={styles.buttonText}>
              Spending Overview
            </ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedView style={styles.sectionsWrapper}>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView style={styles.dateHeaderContainer}>
              <View style={styles.dateHeader}>
                <ThemedText type="small">December 13, 2025</ThemedText>
                <ThemedText type="smallBold">€112.75</ThemedText>
              </View>
            </ThemedView>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <ThemedText type="smallBold" style={styles.tableHeaderCell}>Description</ThemedText>
                <ThemedText type="smallBold" style={[styles.tableHeaderCell, styles.amountCell]}>Amount</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Groceries</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€45.50</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Gas</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€62.00</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Coffee</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€5.25</ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView style={styles.dateHeaderContainer}>
              <View style={styles.dateHeader}>
                <ThemedText type="small">December 12, 2025</ThemedText>
                <ThemedText type="smallBold">€89.30</ThemedText>
              </View>
            </ThemedView>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <ThemedText type="smallBold" style={styles.tableHeaderCell}>Description</ThemedText>
                <ThemedText type="smallBold" style={[styles.tableHeaderCell, styles.amountCell]}>Amount</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Dinner</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€35.50</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Movie</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€15.00</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Parking</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€3.80</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Pharmacy</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€35.00</ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView style={styles.dateHeaderContainer}>
              <View style={styles.dateHeader}>
                <ThemedText type="small">December 11, 2025</ThemedText>
                <ThemedText type="smallBold">€156.45</ThemedText>
              </View>
            </ThemedView>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <ThemedText type="smallBold" style={styles.tableHeaderCell}>Description</ThemedText>
                <ThemedText type="smallBold" style={[styles.tableHeaderCell, styles.amountCell]}>Amount</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Groceries</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€52.30</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Pharmacy</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€28.75</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Restaurant</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€45.20</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Books</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€30.20</ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView style={styles.dateHeaderContainer}>
              <View style={styles.dateHeader}>
                <ThemedText type="small">December 10, 2025</ThemedText>
                <ThemedText type="smallBold">€73.55</ThemedText>
              </View>
            </ThemedView>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <ThemedText type="smallBold" style={styles.tableHeaderCell}>Description</ThemedText>
                <ThemedText type="smallBold" style={[styles.tableHeaderCell, styles.amountCell]}>Amount</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Coffee</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€4.50</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Gym Membership</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€45.00</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Groceries</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€20.05</ThemedText>
              </View>
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.tableCell}>Transport</ThemedText>
                <ThemedText type="small" style={[styles.tableCell, styles.amountCell]}>€4.00</ThemedText>
              </View>
            </View>
          </ThemedView>
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>

      {/* Floating Add Button */}
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
  fab: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    backgroundColor: '#22c55e', // Tailwind green-500
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
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  addButton: {
    marginLeft: Spacing.two,
    backgroundColor: '#22c55e', // Tailwind green-500
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  titleContainer: {
    gap: Spacing.half,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  buttonSection: {
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
  pressed: {
    opacity: 0.7,
  },
  sectionsWrapper: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
  },
  section: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  description: {
    lineHeight: 22,
    marginTop: Spacing.three,
  },
  table: {
    marginTop: Spacing.two,
    marginHorizontal: -Spacing.four,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableHeaderCell: {
    flex: 1,
  },
  tableCell: {
    flex: 1,
  },
  amountCell: {
    textAlign: 'right',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateHeaderContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginHorizontal: -Spacing.four,
    marginVertical: -Spacing.two,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.four,
  },
});
