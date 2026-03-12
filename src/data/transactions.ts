import { type DailyTransactions } from '@/schemas/transaction';
import { CATEGORIES } from '@/constants/categories';

export const TRANSACTION_SECTIONS: DailyTransactions[] = [
  {
    date: new Date(2025, 11, 15),
    totalAmount: -365.45,
    transactions: [
      { id: 1, category: CATEGORIES.groceries, amount: -85.50, date: new Date(2025, 11, 15), note: 'Weekly groceries', labels: ['Lidl', 'Food'] },
      { id: 2, category: CATEGORIES.dining, amount: -65.00, date: new Date(2025, 11, 15), note: 'Dinner with friends', labels: ['Trattoria', 'Restaurant'] },
      { id: 3, category: CATEGORIES.shopping, amount: -95.00, date: new Date(2025, 11, 15), labels: ['H&M', 'Clothing'] },
      { id: 4, category: CATEGORIES.entertainment, amount: -39.95, date: new Date(2025, 11, 15), labels: ['Streaming Services', 'Subscription'] },
      { id: 5, category: CATEGORIES.utilities, amount: -80.00, date: new Date(2025, 11, 15), note: 'Electric bill', labels: ['Power', 'Monthly'] },
    ],
  },
  {
    date: new Date(2025, 11, 14),
    totalAmount: -248.75,
    transactions: [
      { id: 6, category: CATEGORIES.transport, amount: -85.00, date: new Date(2025, 11, 14), note: 'Monthly parking', labels: ['Parking', 'Commute'] },
      { id: 7, category: CATEGORIES.health, amount: -60.00, date: new Date(2025, 11, 14), note: 'Doctor visit', labels: ['Clinic', 'Medical'] },
      { id: 8, category: CATEGORIES.groceries, amount: -35.75, date: new Date(2025, 11, 14), labels: ['Albert Heijn', 'Food'] },
      { id: 9, category: CATEGORIES.entertainment, amount: -18.00, date: new Date(2025, 11, 14), labels: ['Coffee Shop', 'Beverage'] },
      { id: 10, category: CATEGORIES.personalCare, amount: -50.00, date: new Date(2025, 11, 14), labels: ['Salon', 'Haircut'] },
    ],
  },
  {
    date: new Date(2025, 11, 13),
    totalAmount: -307.30,
    transactions: [
      { id: 11, category: CATEGORIES.dining, amount: -75.50, date: new Date(2025, 11, 13), note: 'Lunch meeting', labels: ['Business District', 'Restaurant'] },
      { id: 12, category: CATEGORIES.shopping, amount: -85.80, date: new Date(2025, 11, 13), labels: ['Target', 'Household'] },
      { id: 13, category: CATEGORIES.health, amount: -51.00, date: new Date(2025, 11, 13), labels: ['Pharmacy', 'Medicine'] },
      { id: 14, category: CATEGORIES.travel, amount: -95.00, date: new Date(2025, 11, 13), labels: ['Flight', 'Vacation'] },
    ],
  },
  {
    date: new Date(2025, 11, 12),
    totalAmount: -226.80,
    transactions: [
      { id: 15, category: CATEGORIES.groceries, amount: -62.50, date: new Date(2025, 11, 12), note: 'Weekly shopping', labels: ['Rewe', 'Food'] },
      { id: 16, category: CATEGORIES.entertainment, amount: -38.00, date: new Date(2025, 11, 12), note: 'Cinema tickets', labels: ['Pathé Cinema', 'Movies'] },
      { id: 17, category: CATEGORIES.transport, amount: -28.30, date: new Date(2025, 11, 12), labels: ['Public Transport', 'Commute'] },
      { id: 18, category: CATEGORIES.gym, amount: -28.00, date: new Date(2025, 11, 12), labels: ['Fitness Center', 'Gym'] },
      { id: 19, category: CATEGORIES.subscriptions, amount: -70.00, date: new Date(2025, 11, 12), labels: ['Software & Music', 'Annual'] },
    ],
  },
  {
    date: new Date(2025, 11, 11),
    totalAmount: 4500.00,
    transactions: [
      { id: 20, category: CATEGORIES.salary, amount: 4500.00, date: new Date(2025, 11, 11), note: 'Monthly salary', labels: ['Employer', 'Income'] },
    ],
  },
  {
    date: new Date(2025, 11, 10),
    totalAmount: -273.50,
    transactions: [
      { id: 21, category: CATEGORIES.dining, amount: -55.00, date: new Date(2025, 11, 10), note: 'Anniversary dinner', labels: ['Milano', 'Restaurant'] },
      { id: 22, category: CATEGORIES.shopping, amount: -78.50, date: new Date(2025, 11, 10), labels: ['Amazon', 'Online'] },
      { id: 23, category: CATEGORIES.entertainment, amount: -45.00, date: new Date(2025, 11, 10), labels: ['Sports Event', 'Tickets'] },
      { id: 24, category: CATEGORIES.transport, amount: -20.00, date: new Date(2025, 11, 10), labels: ['Taxi', 'Commute'] },
      { id: 25, category: CATEGORIES.personalCare, amount: -75.00, date: new Date(2025, 11, 10), labels: ['Spa', 'Wellness'] },
    ],
  },
  {
    date: new Date(2025, 11, 9),
    totalAmount: 250.00,
    transactions: [
      { id: 26, category: CATEGORIES.freelance, amount: 250.00, date: new Date(2025, 11, 9), labels: ['Client Work', 'Income'] },
    ],
  },
  {
    date: new Date(2025, 11, 8),
    totalAmount: -210.25,
    transactions: [
      { id: 27, category: CATEGORIES.groceries, amount: -48.75, date: new Date(2025, 11, 8), labels: ['Market', 'Food'] },
      { id: 28, category: CATEGORIES.gym, amount: -60.00, date: new Date(2025, 11, 8), note: 'Monthly gym', labels: ['FitnessPro', 'Fitness'] },
      { id: 29, category: CATEGORIES.entertainment, amount: -22.50, date: new Date(2025, 11, 8), labels: ['Netflix', 'Streaming'] },
      { id: 30, category: CATEGORIES.gas, amount: -14.00, date: new Date(2025, 11, 8), labels: ['Gas Station', 'Fuel'] },
      { id: 31, category: CATEGORIES.utilities, amount: -65.00, date: new Date(2025, 11, 8), note: 'Internet bill', labels: ['ISP', 'Monthly'] },
    ],
  },
];
