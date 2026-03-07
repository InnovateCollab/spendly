/**
 * Formatting utilities for display values
 */

/** Format number as currency */
export function formatCurrency(
    amount: number,
    currency: string = '€',
): string {
    return `${currency}${amount.toFixed(2)}`;
}

/** Format transaction amount with proper sign and currency placement */
export function formatTransactionAmount(amount: number, currency: string = '€'): string {
    const absAmount = Math.abs(amount).toFixed(2);
    if (amount < 0) {
        return `-${currency}${absAmount}`;
    }
    return `${currency}${absAmount}`;
}

/** Format date as readable string */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
