import { type DailyTransactions } from '@/schemas/transaction';

export const TRANSACTION_SECTIONS: DailyTransactions[] = [
  {
    date: new Date(2025, 11, 15),
    totalAmount: -285.45,
    transactions: [
      { id: 'tx-1', category: 'Groceries', amount: -85.50, date: new Date(2025, 11, 15), note: 'Weekly groceries', labels: ['Lidl', 'Food'] },
      { id: 'tx-2', category: 'Dining', amount: -65.00, date: new Date(2025, 11, 15), note: 'Dinner with friends', labels: ['Trattoria', 'Restaurant'] },
      { id: 'tx-3', category: 'Shopping', amount: -95.00, date: new Date(2025, 11, 15), labels: ['H&M', 'Clothing'] },
      { id: 'tx-4', category: 'Entertainment', amount: -39.95, date: new Date(2025, 11, 15), labels: ['Streaming Services', 'Subscription'] },
    ],
  },
  {
    date: new Date(2025, 11, 14),
    totalAmount: -198.75,
    transactions: [
      { id: 'tx-5', category: 'Transport', amount: -85.00, date: new Date(2025, 11, 14), note: 'Monthly parking', labels: ['Parking', 'Commute'] },
      { id: 'tx-6', category: 'Health', amount: -60.00, date: new Date(2025, 11, 14), note: 'Doctor visit', labels: ['Clinic', 'Medical'] },
      { id: 'tx-7', category: 'Groceries', amount: -35.75, date: new Date(2025, 11, 14), labels: ['Albert Heijn', 'Food'] },
      { id: 'tx-8', category: 'Entertainment', amount: -18.00, date: new Date(2025, 11, 14), labels: ['Coffee Shop', 'Beverage'] },
    ],
  },
  {
    date: new Date(2025, 11, 13),
    totalAmount: -212.30,
    transactions: [
      { id: 'tx-9', category: 'Dining', amount: -75.50, date: new Date(2025, 11, 13), note: 'Lunch meeting', labels: ['Business District', 'Restaurant'] },
      { id: 'tx-10', category: 'Shopping', amount: -85.80, date: new Date(2025, 11, 13), labels: ['Target', 'Household'] },
      { id: 'tx-11', category: 'Health', amount: -51.00, date: new Date(2025, 11, 13), labels: ['Pharmacy', 'Medicine'] },
    ],
  },
  {
    date: new Date(2025, 11, 12),
    totalAmount: -156.80,
    transactions: [
      { id: 'tx-12', category: 'Groceries', amount: -62.50, date: new Date(2025, 11, 12), note: 'Weekly shopping', labels: ['Rewe', 'Food'] },
      { id: 'tx-13', category: 'Entertainment', amount: -38.00, date: new Date(2025, 11, 12), note: 'Cinema tickets', labels: ['Pathé Cinema', 'Movies'] },
      { id: 'tx-14', category: 'Transport', amount: -28.30, date: new Date(2025, 11, 12), labels: ['Public Transport', 'Commute'] },
      { id: 'tx-15', category: 'Health', amount: -28.00, date: new Date(2025, 11, 12), labels: ['Fitness Center', 'Gym'] },
    ],
  },
  {
    date: new Date(2025, 11, 11),
    totalAmount: 4500.00,
    transactions: [
      { id: 'tx-16', category: 'Salary', amount: 4500.00, date: new Date(2025, 11, 11), note: 'Monthly salary', labels: ['Employer', 'Income'] },
    ],
  },
  {
    date: new Date(2025, 11, 10),
    totalAmount: -198.50,
    transactions: [
      { id: 'tx-17', category: 'Dining', amount: -55.00, date: new Date(2025, 11, 10), note: 'Anniversary dinner', labels: ['Milano', 'Restaurant'] },
      { id: 'tx-18', category: 'Shopping', amount: -78.50, date: new Date(2025, 11, 10), labels: ['Amazon', 'Online'] },
      { id: 'tx-19', category: 'Entertainment', amount: -45.00, date: new Date(2025, 11, 10), labels: ['Sports Event', 'Tickets'] },
      { id: 'tx-20', category: 'Transport', amount: -20.00, date: new Date(2025, 11, 10), labels: ['Taxi', 'Commute'] },
    ],
  },
  {
    date: new Date(2025, 11, 9),
    totalAmount: 250.00,
    transactions: [
      { id: 'tx-21', category: 'Freelance', amount: 250.00, date: new Date(2025, 11, 9), labels: ['Client Work', 'Income'] },
    ],
  },
  {
    date: new Date(2025, 11, 8),
    totalAmount: -145.25,
    transactions: [
      { id: 'tx-22', category: 'Groceries', amount: -48.75, date: new Date(2025, 11, 8), labels: ['Market', 'Food'] },
      { id: 'tx-23', category: 'Health', amount: -60.00, date: new Date(2025, 11, 8), note: 'Monthly gym', labels: ['FitnessPro', 'Fitness'] },
      { id: 'tx-24', category: 'Entertainment', amount: -22.50, date: new Date(2025, 11, 8), labels: ['Netflix', 'Streaming'] },
      { id: 'tx-25', category: 'Transport', amount: -14.00, date: new Date(2025, 11, 8), labels: ['Gas Station', 'Fuel'] },
    ],
  },
];
