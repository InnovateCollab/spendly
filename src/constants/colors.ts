/**
 * Centralized color palette for financial data visualization
 */

export const COLORS = {
    // Transaction status colors
    income: '#22c55e',      // Green
    expense: '#ef4444',     // Red

    // Chart colors
    chart: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],

    // UI colors
    label: '#e3f2fd',       // Light blue background for labels
    border: '#f0f0f0',      // Light gray borders
    icon: '#FBBF24',        // Gold for icons
} as const;

export const AMOUNT_CONFIG = {
    displayLimit: 5,        // Show 5 items, then "Show More"
} as const;
