import { type Transaction, type TransactionSectionData } from '@/schemas/transaction';

export const TRANSACTION_SECTIONS: TransactionSectionData[] = [
  {
    date: 'December 13, 2025',
    amount: '€112.75',
    transactions: [
      { id: 'tx-1', category: 'Groceries', icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }, amount: 45.50, color: '#10b981', date: new Date(2025, 11, 13), note: 'Weekly groceries', labels: ['Lidl'] },
      { id: 'tx-2', category: 'Gas', icon: { ios: 'fuelpump.fill', android: 'local_gas_station', web: 'local_gas_station' }, amount: 62.00, color: '#f97316', date: new Date(2025, 11, 13), note: 'Tank refill', labels: ['Shell'] },
      { id: 'tx-3', category: 'Coffee', icon: { ios: 'cup.and.saucer.fill', android: 'coffee', web: 'coffee' }, amount: 5.25, color: '#92400e', date: new Date(2025, 11, 13), labels: ['Caffeine Co.'] },
    ],
  },
  {
    date: 'December 12, 2025',
    amount: '€89.30',
    transactions: [
      { id: 'tx-4', category: 'Dinner', icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }, amount: 35.50, color: '#ef4444', date: new Date(2025, 11, 12), note: 'Anniversary dinner', labels: ['Milano Restaurant'] },
      { id: 'tx-5', category: 'Movie', icon: { ios: 'film.fill', android: 'movie', web: 'movie' }, amount: 15.00, color: '#8b5cf6', date: new Date(2025, 11, 12), note: 'Two tickets', labels: ['Pathé Cinema'] },
      { id: 'tx-6', category: 'Parking', icon: { ios: 'car.fill', android: 'local_parking', web: 'local_parking' }, amount: 3.80, color: '#6b7280', date: new Date(2025, 11, 12), labels: ['City Center'] },
      { id: 'tx-7', category: 'Pharmacy', icon: { ios: 'cross.case.fill', android: 'local_pharmacy', web: 'local_pharmacy' }, amount: 35.00, color: '#3b82f6', date: new Date(2025, 11, 12), note: 'Vitamins & cold medicine', labels: ['Apotheek'] },
    ],
  },
  {
    date: 'December 11, 2025',
    amount: '€156.45',
    transactions: [
      { id: 'tx-8', category: 'Groceries', icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }, amount: 52.30, color: '#10b981', date: new Date(2025, 11, 11), note: 'Weekly shopping', labels: ['Albert Heijn'] },
      { id: 'tx-9', category: 'Pharmacy', icon: { ios: 'cross.case.fill', android: 'local_pharmacy', web: 'local_pharmacy' }, amount: 28.75, color: '#3b82f6', date: new Date(2025, 11, 11), labels: ['Farmacy Plus'] },
      { id: 'tx-10', category: 'Restaurant', icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }, amount: 45.20, color: '#ef4444', date: new Date(2025, 11, 11), note: 'Team lunch', labels: ['La Dolce Vita'] },
      { id: 'tx-11', category: 'Books', icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' }, amount: 30.20, color: '#f59e0b', date: new Date(2025, 11, 11), labels: ['Bookstore Classics'] },
    ],
  },
  {
    date: 'December 10, 2025',
    amount: '€73.55',
    transactions: [
      { id: 'tx-12', category: 'Coffee', icon: { ios: 'cup.and.saucer.fill', android: 'coffee', web: 'coffee' }, amount: 4.50, color: '#92400e', date: new Date(2025, 11, 10), labels: ['Morning Brew'] },
      { id: 'tx-13', category: 'Gym Membership', icon: { ios: 'figure.run', android: 'fitness_center', web: 'fitness_center' }, amount: 45.00, color: '#06b6d4', date: new Date(2025, 11, 10), note: 'Monthly fee', labels: ['FitnessPro Gym'] },
      { id: 'tx-14', category: 'Groceries', icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }, amount: 20.05, color: '#10b981', date: new Date(2025, 11, 10), labels: ['Rewe'] },
      { id: 'tx-15', category: 'Transport', icon: { ios: 'bus.fill', android: 'directions_bus', web: 'directions_bus' }, amount: 4.00, color: '#06b6d4', date: new Date(2025, 11, 10), note: 'Daily ticket', labels: ['Public Transport'] },
    ],
  },
];
