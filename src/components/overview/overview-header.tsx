/**
 * Overview header with total cash flow and month selector
 */

import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Spacing } from '@/constants/theme';
import { AmountDisplay } from '@/components/common/amount-display';

interface MonthOption {
    label: string;
    value: string;
}

interface OverviewHeaderProps {
    totalCashFlow: number;
    selectedMonth: string;
    months: MonthOption[];
    onMonthChange: (month: string) => void;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
    totalCashFlow,
    selectedMonth,
    months,
    onMonthChange,
}) => {
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.titleContainer}>
                <AmountDisplay amount={totalCashFlow} type="currency" />
                <View style={styles.row}>
                    <ThemedText style={styles.centerText} themeColor="textSecondary">
                        Cash Flow
                    </ThemedText>
                </View>
            </ThemedView>

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
                            onPress={() => onMonthChange(month.value)}
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
    );
};

const styles = StyleSheet.create({
    container: {
        gap: Spacing.half,
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
    },
    titleContainer: {
        gap: Spacing.half,
        alignItems: 'center',
    },
    centerText: {
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.one,
        gap: Spacing.two,
    },
    monthScrollContainer: {
        flex: 1,
        marginHorizontal: -Spacing.four,
    },
    monthList: {
        gap: Spacing.two,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.one,
        minWidth: '100%',
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
