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

/** Format date as readable string */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
