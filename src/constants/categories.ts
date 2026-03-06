import { SymbolViewProps } from 'expo-symbols';

export interface Category {
    name: string;
    icon: SymbolViewProps['name'];
    color: string;
}

export const CATEGORIES: Record<string, Category> = {
    groceries: {
        name: 'Groceries',
        icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' },
        color: '#10b981',
    },
    gas: {
        name: 'Gas',
        icon: { ios: 'fuelpump.fill', android: 'local_gas_station', web: 'local_gas_station' },
        color: '#f97316',
    },
    coffee: {
        name: 'Coffee',
        icon: { ios: 'cup.and.saucer.fill', android: 'coffee', web: 'coffee' },
        color: '#92400e',
    },
    dining: {
        name: 'Dining',
        icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
        color: '#ef4444',
    },
    entertainment: {
        name: 'Entertainment',
        icon: { ios: 'film.fill', android: 'movie', web: 'movie' },
        color: '#8b5cf6',
    },
    parking: {
        name: 'Parking',
        icon: { ios: 'car.fill', android: 'local_parking', web: 'local_parking' },
        color: '#6b7280',
    },
    pharmacy: {
        name: 'Pharmacy',
        icon: { ios: 'cross.case.fill', android: 'local_pharmacy', web: 'local_pharmacy' },
        color: '#3b82f6',
    },
    books: {
        name: 'Books',
        icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
        color: '#f59e0b',
    },
    gym: {
        name: 'Gym',
        icon: { ios: 'figure.run', android: 'fitness_center', web: 'fitness_center' },
        color: '#06b6d4',
    },
    transport: {
        name: 'Transport',
        icon: { ios: 'bus.fill', android: 'directions_bus', web: 'directions_bus' },
        color: '#06b6d4',
    },
};

export function getCategory(categoryName: string): Category | undefined {
    return CATEGORIES[categoryName.toLowerCase()];
}
