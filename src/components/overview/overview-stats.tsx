/**
 * Overview stat cards showing Total Wealth and Monthly Cash Flow
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Spacing } from '@/constants/theme';
import { COLORS } from '@/constants/colors';
import { AmountDisplay } from '@/components/common/amount-display';

interface OverviewStatsProps {
    totalIncome: number;
    monthlyCashFlow: number;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ totalIncome, monthlyCashFlow }) => {
    return (
        <ThemedView style={styles.wrapper}>
            <ThemedView type="backgroundElement" style={styles.card}>
                <View style={styles.content}>
                    <AmountDisplay amount={totalIncome} type="currency" />
                    <ThemedText type="small" themeColor="textSecondary">
                        Total Wealth
                    </ThemedText>
                </View>
            </ThemedView>

            <ThemedView type="backgroundElement" style={[styles.card, styles.cardSelected]}>
                <View style={styles.content}>
                    <AmountDisplay amount={monthlyCashFlow} type="currency" />
                    <ThemedText type="small" themeColor="textSecondary">
                        Monthly Cash Flow
                    </ThemedText>
                </View>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        gap: Spacing.two,
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.three,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: Spacing.one,
    },
    card: {
        flex: 1,
        padding: Spacing.two,
        borderRadius: Spacing.two,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.one,
    },
    cardSelected: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#d0d0d0',
    },
    content: {
        alignItems: 'center',
    },
});
