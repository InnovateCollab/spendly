import { type DailyTransactions } from '@/schemas/transaction';

export const TRANSACTION_SECTIONS: DailyTransactions[] = [
  {
    date: new Date(2025, 11, 15),
    totalAmount: -365.45,
    transactions: [
      { id: 'tx-1', category: 'Groceries', amount: -85.50, date: new Date(2025, 11, 15), note: 'Weekly groceries', labels: ['Lidl', 'Food'] },
      { id: 'tx-2', category: 'Dining', amount: -65.00, date: new Date(2025, 11, 15), note: 'Dinner with friends', labels: ['Trattoria', 'Restaurant'] },
      { id: 'tx-3', category: 'Shopping', amount: -95.00, date: new Date(2025, 11, 15), labels: ['H&M', 'Clothing'] },
      { id: 'tx-4', category: 'Entertainment', amount: -39.95, date: new Date(2025, 11, 15), labels: ['Streaming Services', 'Subscription'] },
      { id: 'tx-4a', category: 'Utilities', amount: -80.00, date: new Date(2025, 11, 15), note: 'Electric bill', labels: ['Power', 'Monthly'] },
    ],
  },
  {
    date: new Date(2025, 11, 14),
    totalAmount: -248.75,
    transactions: [
      { id: 'tx-5', category: 'Transport', amount: -85.00, date: new Date(2025, 11, 14), note: 'Monthly parking', labels: ['Parking', 'Commute'] },
      { id: 'tx-6', category: 'Health', amount: -60.00, date: new Date(2025, 11, 14), note: 'Doctor visit', labels: ['Clinic', 'Medical'] },
      { id: 'tx-7', category: 'Groceries', amount: -35.75, date: new Date(2025, 11, 14), labels: ['Albert Heijn', 'Food'] },
      { id: 'tx-8', category: 'Entertainment', amount: -18.00, date: new Date(2025, 11, 14), labels: ['Coffee Shop', 'Beverage'] },
      { id: 'tx-8a', category: 'Personal Care', amount: -50.00, date: new Date(2025, 11, 14), labels: ['Salon', 'Haircut'] },
    ],
  },
  {
    date: new Date(2025, 11, 13),
    totalAmount: -307.30,
    transactions: [
      { id: 'tx-9', category: 'Dining', amount: -75.50, date: new Date(2025, 11, 13), note: 'Lunch meeting', labels: ['Business District', 'Restaurant'] },
      { id: 'tx-10', category: 'Shopping', amount: -85.80, date: new Date(2025, 11, 13), labels: ['Target', 'Household'] },
      { id: 'tx-11', category: 'Health', amount: -51.00, date: new Date(2025, 11, 13), labels: ['Pharmacy', 'Medicine'] },
      { id: 'tx-11b', category: 'Travel', amount: -95.00, date: new Date(2025, 11, 13), labels: ['Flight', 'Vacation'] },
    ],
  },
  {
    date: new Date(2025, 11, 12),
    totalAmount: -226.80,
    transactions: [
      { id: 'tx-12', category: 'Groceries', amount: -62.50, date: new Date(2025, 11, 12), note: 'Weekly shopping', labels: ['Rewe', 'Food'] },
      { id: 'tx-13', category: 'Entertainment', amount: -38.00, date: new Date(2025, 11, 12), note: 'Cinema tickets', labels: ['Pathé Cinema', 'Movies'] },
      { id: 'tx-14', category: 'Transport', amount: -28.30, date: new Date(2025, 11, 12), labels: ['Public Transport', 'Commute'] },
      { id: 'tx-15', category: 'Health', amount: -28.00, date: new Date(2025, 11, 12), labels: ['Fitness Center', 'Gym'] },
      { id: 'tx-15b', category: 'Subscriptions', amount: -70.00, date: new Date(2025, 11, 12), labels: ['Software & Music', 'Annual'] },
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
    totalAmount: -273.50,
    transactions: [
      { id: 'tx-17', category: 'Dining', amount: -55.00, date: new Date(2025, 11, 10), note: 'Anniversary dinner', labels: ['Milano', 'Restaurant'] },
      { id: 'tx-18', category: 'Shopping', amount: -78.50, date: new Date(2025, 11, 10), labels: ['Amazon', 'Online'] },
      { id: 'tx-19', category: 'Entertainment', amount: -45.00, date: new Date(2025, 11, 10), labels: ['Sports Event', 'Tickets'] },
      { id: 'tx-20', category: 'Transport', amount: -20.00, date: new Date(2025, 11, 10), labels: ['Taxi', 'Commute'] },
      { id: 'tx-20b', category: 'Personal Care', amount: -75.00, date: new Date(2025, 11, 10), labels: ['Spa', 'Wellness'] },
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
    totalAmount: -210.25,
    transactions: [
      { id: 'tx-22', category: 'Groceries', amount: -48.75, date: new Date(2025, 11, 8), labels: ['Market', 'Food'] },
      { id: 'tx-23', category: 'Health', amount: -60.00, date: new Date(2025, 11, 8), note: 'Monthly gym', labels: ['FitnessPro', 'Fitness'] },
      { id: 'tx-24', category: 'Entertainment', amount: -22.50, date: new Date(2025, 11, 8), labels: ['Netflix', 'Streaming'] },
      { id: 'tx-25', category: 'Transport', amount: -14.00, date: new Date(2025, 11, 8), labels: ['Gas Station', 'Fuel'] },
      { id: 'tx-25b', category: 'Utilities', amount: -65.00, date: new Date(2025, 11, 8), note: 'Internet bill', labels: ['ISP', 'Monthly'] },
    ],
  },
];
