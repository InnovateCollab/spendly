import { type DailyTransactions } from '@/schemas/transaction';

export const TRANSACTION_SECTIONS: DailyTransactions[] = [
  {
    date: new Date(2025, 11, 13),
    totalAmount: 112.75,
    transactions: [
      { id: 'tx-1', category: 'Groceries', amount: 45.50, date: new Date(2025, 11, 13), note: 'Weekly groceries', labels: ['Lidl'] },
      { id: 'tx-2', category: 'Gas', amount: 62.00, date: new Date(2025, 11, 13), note: 'Tank refill', labels: ['Shell'] },
      { id: 'tx-3', category: 'Coffee', amount: 5.25, date: new Date(2025, 11, 13), labels: ['Caffeine Co.'] },
    ],
  },
  {
    date: new Date(2025, 11, 12),
    totalAmount: 89.30,
    transactions: [
      { id: 'tx-4', category: 'Dining', amount: 35.50, date: new Date(2025, 11, 12), note: 'Anniversary dinner', labels: ['Milano Restaurant'] },
      { id: 'tx-5', category: 'Entertainment', amount: 15.00, date: new Date(2025, 11, 12), note: 'Two tickets', labels: ['Pathé Cinema'] },
      { id: 'tx-6', category: 'Parking', amount: 3.80, date: new Date(2025, 11, 12), labels: ['City Center'] },
      { id: 'tx-7', category: 'Pharmacy', amount: 35.00, date: new Date(2025, 11, 12), note: 'Vitamins & cold medicine', labels: ['Apotheek'] },
    ],
  },
  {
    date: new Date(2025, 11, 11),
    totalAmount: 156.45,
    transactions: [
      { id: 'tx-8', category: 'Groceries', amount: 52.30, date: new Date(2025, 11, 11), note: 'Weekly shopping', labels: ['Albert Heijn'] },
      { id: 'tx-9', category: 'Pharmacy', amount: 28.75, date: new Date(2025, 11, 11), labels: ['Farmacy Plus'] },
      { id: 'tx-10', category: 'Dining', amount: 45.20, date: new Date(2025, 11, 11), note: 'Team lunch', labels: ['La Dolce Vita'] },
      { id: 'tx-11', category: 'Books', amount: 30.20, date: new Date(2025, 11, 11), labels: ['Bookstore Classics'] },
    ],
  },
  {
    date: new Date(2025, 11, 10),
    totalAmount: 73.55,
    transactions: [
      { id: 'tx-12', category: 'Coffee', amount: 4.50, date: new Date(2025, 11, 10), labels: ['Morning Brew'] },
      { id: 'tx-13', category: 'Gym', amount: 45.00, date: new Date(2025, 11, 10), note: 'Monthly fee', labels: ['FitnessPro Gym'] },
      { id: 'tx-14', category: 'Groceries', amount: 20.05, date: new Date(2025, 11, 10), labels: ['Rewe'] },
      { id: 'tx-15', category: 'Transport', amount: 4.00, date: new Date(2025, 11, 10), note: 'Daily ticket', labels: ['Public Transport'] },
    ],
  },
];
