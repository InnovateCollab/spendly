/**
 * Reusable component for displaying transaction amounts
 * Automatically colors based on income (green) or expense (red)
 */

import React from 'react';
import { ThemedText } from '@/components/ui/themed-text';
import { COLORS } from '@/constants/colors';
import { formatTransactionAmount, formatCurrency } from '@/utils/formatting';

interface AmountDisplayProps {
    amount: number;
    type?: 'transaction' | 'currency'; // transaction = $-100.50, currency = $5,000
    style?: React.ComponentProps<typeof ThemedText>['style'];
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
    amount,
    type = 'transaction',
    style,
}) => {
    const isIncome = amount >= 0;
    const color = isIncome ? COLORS.income : COLORS.expense;
    const formattedAmount = type === 'currency' ? formatCurrency(amount) : formatTransactionAmount(amount);

    return (
        <ThemedText
            type="default"
            style={[
                {
                    color,
                    fontWeight: '600',
                },
                style,
            ]}
        >
            {formattedAmount}
        </ThemedText>
    );
};
