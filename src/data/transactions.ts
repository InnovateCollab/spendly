import { type DailyTransactions } from '@/schemas/transaction';
import { CATEGORIES } from '@/constants/categories';

export const TRANSACTION_SECTIONS: DailyTransactions[] = [
  // March 2026
  {
    date: new Date(2026, 2, 15),
    totalAmount: -285.00,
    transactions: [
      { id: 1, category: CATEGORIES.groceries, amount: -62.00, date: new Date(2026, 2, 15), note: 'Weekly groceries', labels: ['Food'] },
      { id: 2, category: CATEGORIES.dining, amount: -75.00, date: new Date(2026, 2, 15), note: 'Dinner', labels: ['Restaurant'] },
      { id: 3, category: CATEGORIES.shopping, amount: -88.00, date: new Date(2026, 2, 15), labels: ['Shopping'] },
      { id: 4, category: CATEGORIES.utilities, amount: -60.00, date: new Date(2026, 2, 15), labels: ['Bills'] },
    ],
  },
  {
    date: new Date(2026, 2, 10),
    totalAmount: 3000.00,
    transactions: [
      { id: 5, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2026, 2, 10), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2026, 2, 5),
    totalAmount: -145.50,
    transactions: [
      { id: 6, category: CATEGORIES.health, amount: -50.00, date: new Date(2026, 2, 5), labels: ['Medical'] },
      { id: 7, category: CATEGORIES.transport, amount: -45.50, date: new Date(2026, 2, 5), labels: ['Commute'] },
      { id: 8, category: CATEGORIES.entertainment, amount: -50.00, date: new Date(2026, 2, 5), labels: ['Streaming'] },
    ],
  },

  // February 2026
  {
    date: new Date(2026, 1, 28),
    totalAmount: -320.75,
    transactions: [
      { id: 9, category: CATEGORIES.shopping, amount: -92.50, date: new Date(2026, 1, 28), labels: ['Shopping'] },
      { id: 10, category: CATEGORIES.dining, amount: -68.25, date: new Date(2026, 1, 28), labels: ['Restaurant'] },
      { id: 11, category: CATEGORIES.gym, amount: -60.00, date: new Date(2026, 1, 28), labels: ['Fitness'] },
      { id: 12, category: CATEGORIES.groceries, amount: -100.00, date: new Date(2026, 1, 28), labels: ['Food'] },
    ],
  },
  {
    date: new Date(2026, 1, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 13, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2026, 1, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2026, 1, 15),
    totalAmount: -198.30,
    transactions: [
      { id: 14, category: CATEGORIES.transport, amount: -55.30, date: new Date(2026, 1, 15), labels: ['Commute'] },
      { id: 15, category: CATEGORIES.personalCare, amount: -70.00, date: new Date(2026, 1, 15), labels: ['Wellness'] },
      { id: 16, category: CATEGORIES.entertainment, amount: -73.00, date: new Date(2026, 1, 15), labels: ['Entertainment'] },
    ],
  },
  {
    date: new Date(2026, 1, 8),
    totalAmount: -156.50,
    transactions: [
      { id: 17, category: CATEGORIES.groceries, amount: -56.50, date: new Date(2026, 1, 8), labels: ['Food'] },
      { id: 18, category: CATEGORIES.health, amount: -100.00, date: new Date(2026, 1, 8), labels: ['Medical'] },
    ],
  },

  // January 2026
  {
    date: new Date(2026, 0, 28),
    totalAmount: -267.00,
    transactions: [
      { id: 19, category: CATEGORIES.shopping, amount: -85.00, date: new Date(2026, 0, 28), labels: ['Shopping'] },
      { id: 20, category: CATEGORIES.dining, amount: -72.00, date: new Date(2026, 0, 28), labels: ['Restaurant'] },
      { id: 21, category: CATEGORIES.entertainment, amount: -60.00, date: new Date(2026, 0, 28), labels: ['Entertainment'] },
      { id: 22, category: CATEGORIES.utilities, amount: -50.00, date: new Date(2026, 0, 28), labels: ['Bills'] },
    ],
  },
  {
    date: new Date(2026, 0, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 23, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2026, 0, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2026, 0, 15),
    totalAmount: -204.75,
    transactions: [
      { id: 24, category: CATEGORIES.groceries, amount: -72.00, date: new Date(2026, 0, 15), labels: ['Food'] },
      { id: 25, category: CATEGORIES.gym, amount: -60.00, date: new Date(2026, 0, 15), labels: ['Fitness'] },
      { id: 26, category: CATEGORIES.health, amount: -45.00, date: new Date(2026, 0, 15), labels: ['Medical'] },
      { id: 27, category: CATEGORIES.transport, amount: -27.75, date: new Date(2026, 0, 15), labels: ['Commute'] },
    ],
  },
  {
    date: new Date(2026, 0, 8),
    totalAmount: -156.00,
    transactions: [
      { id: 28, category: CATEGORIES.dining, amount: -55.00, date: new Date(2026, 0, 8), labels: ['Restaurant'] },
      { id: 29, category: CATEGORIES.shopping, amount: -78.00, date: new Date(2026, 0, 8), labels: ['Shopping'] },
      { id: 30, category: CATEGORIES.entertainment, amount: -23.00, date: new Date(2026, 0, 8), labels: ['Entertainment'] },
    ],
  },

  // December 2025
  {
    date: new Date(2025, 11, 28),
    totalAmount: -298.50,
    transactions: [
      { id: 31, category: CATEGORIES.shopping, amount: -95.50, date: new Date(2025, 11, 28), note: 'Holiday shopping', labels: ['Shopping'] },
      { id: 32, category: CATEGORIES.dining, amount: -78.00, date: new Date(2025, 11, 28), labels: ['Restaurant'] },
      { id: 33, category: CATEGORIES.entertainment, amount: -65.00, date: new Date(2025, 11, 28), labels: ['Entertainment'] },
      { id: 34, category: CATEGORIES.utilities, amount: -60.00, date: new Date(2025, 11, 28), labels: ['Bills'] },
    ],
  },
  {
    date: new Date(2025, 11, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 35, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2025, 11, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2025, 11, 15),
    totalAmount: -245.30,
    transactions: [
      { id: 36, category: CATEGORIES.groceries, amount: -68.50, date: new Date(2025, 11, 15), labels: ['Food'] },
      { id: 37, category: CATEGORIES.gym, amount: -60.00, date: new Date(2025, 11, 15), labels: ['Fitness'] },
      { id: 38, category: CATEGORIES.health, amount: -55.80, date: new Date(2025, 11, 15), labels: ['Medical'] },
      { id: 39, category: CATEGORIES.transport, amount: -61.00, date: new Date(2025, 11, 15), labels: ['Commute'] },
    ],
  },
  {
    date: new Date(2025, 11, 8),
    totalAmount: -189.75,
    transactions: [
      { id: 40, category: CATEGORIES.shopping, amount: -85.75, date: new Date(2025, 11, 8), labels: ['Shopping'] },
      { id: 41, category: CATEGORIES.dining, amount: -62.00, date: new Date(2025, 11, 8), labels: ['Restaurant'] },
      { id: 42, category: CATEGORIES.entertainment, amount: -42.00, date: new Date(2025, 11, 8), labels: ['Entertainment'] },
    ],
  },

  // November 2025
  {
    date: new Date(2025, 10, 28),
    totalAmount: -276.50,
    transactions: [
      { id: 43, category: CATEGORIES.groceries, amount: -75.00, date: new Date(2025, 10, 28), labels: ['Food'] },
      { id: 44, category: CATEGORIES.dining, amount: -70.50, date: new Date(2025, 10, 28), labels: ['Restaurant'] },
      { id: 45, category: CATEGORIES.shopping, amount: -95.00, date: new Date(2025, 10, 28), labels: ['Shopping'] },
      { id: 46, category: CATEGORIES.utilities, amount: -36.00, date: new Date(2025, 10, 28), labels: ['Bills'] },
    ],
  },
  {
    date: new Date(2025, 10, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 47, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2025, 10, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2025, 10, 15),
    totalAmount: -212.80,
    transactions: [
      { id: 48, category: CATEGORIES.health, amount: -60.00, date: new Date(2025, 10, 15), labels: ['Medical'] },
      { id: 49, category: CATEGORIES.transport, amount: -52.80, date: new Date(2025, 10, 15), labels: ['Commute'] },
      { id: 50, category: CATEGORIES.gym, amount: -60.00, date: new Date(2025, 10, 15), labels: ['Fitness'] },
      { id: 51, category: CATEGORIES.entertainment, amount: -40.00, date: new Date(2025, 10, 15), labels: ['Entertainment'] },
    ],
  },
  {
    date: new Date(2025, 10, 8),
    totalAmount: -168.00,
    transactions: [
      { id: 52, category: CATEGORIES.shopping, amount: -72.00, date: new Date(2025, 10, 8), labels: ['Shopping'] },
      { id: 53, category: CATEGORIES.groceries, amount: -60.00, date: new Date(2025, 10, 8), labels: ['Food'] },
      { id: 54, category: CATEGORIES.personalCare, amount: -36.00, date: new Date(2025, 10, 8), labels: ['Wellness'] },
    ],
  },

  // October 2025
  {
    date: new Date(2025, 9, 25),
    totalAmount: -234.60,
    transactions: [
      { id: 55, category: CATEGORIES.dining, amount: -85.00, date: new Date(2025, 9, 25), labels: ['Restaurant'] },
      { id: 56, category: CATEGORIES.shopping, amount: -78.50, date: new Date(2025, 9, 25), labels: ['Shopping'] },
      { id: 57, category: CATEGORIES.entertainment, amount: -55.10, date: new Date(2025, 9, 25), labels: ['Entertainment'] },
      { id: 58, category: CATEGORIES.transport, amount: -16.00, date: new Date(2025, 9, 25), labels: ['Commute'] },
    ],
  },
  {
    date: new Date(2025, 9, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 59, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2025, 9, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2025, 9, 15),
    totalAmount: -189.40,
    transactions: [
      { id: 60, category: CATEGORIES.groceries, amount: -65.00, date: new Date(2025, 9, 15), labels: ['Food'] },
      { id: 61, category: CATEGORIES.health, amount: -55.00, date: new Date(2025, 9, 15), labels: ['Medical'] },
      { id: 62, category: CATEGORIES.gym, amount: -60.00, date: new Date(2025, 9, 15), labels: ['Fitness'] },
      { id: 63, category: CATEGORIES.personalCare, amount: -9.40, date: new Date(2025, 9, 15), labels: ['Wellness'] },
    ],
  },
  {
    date: new Date(2025, 9, 10),
    totalAmount: -143.50,
    transactions: [
      { id: 64, category: CATEGORIES.shopping, amount: -68.50, date: new Date(2025, 9, 10), labels: ['Shopping'] },
      { id: 65, category: CATEGORIES.dining, amount: -55.00, date: new Date(2025, 9, 10), labels: ['Restaurant'] },
      { id: 66, category: CATEGORIES.utilities, amount: -20.00, date: new Date(2025, 9, 10), labels: ['Bills'] },
    ],
  },

  // September 2025
  {
    date: new Date(2025, 8, 28),
    totalAmount: -301.75,
    transactions: [
      { id: 67, category: CATEGORIES.shopping, amount: -105.00, date: new Date(2025, 8, 28), labels: ['Shopping'] },
      { id: 68, category: CATEGORIES.groceries, amount: -82.50, date: new Date(2025, 8, 28), labels: ['Food'] },
      { id: 69, category: CATEGORIES.dining, amount: -68.25, date: new Date(2025, 8, 28), labels: ['Restaurant'] },
      { id: 70, category: CATEGORIES.entertainment, amount: -46.00, date: new Date(2025, 8, 28), labels: ['Entertainment'] },
    ],
  },
  {
    date: new Date(2025, 8, 22),
    totalAmount: -156.30,
    transactions: [
      { id: 71, category: CATEGORIES.health, amount: -75.00, date: new Date(2025, 8, 22), labels: ['Medical'] },
      { id: 72, category: CATEGORIES.transport, amount: -48.30, date: new Date(2025, 8, 22), labels: ['Commute'] },
      { id: 73, category: CATEGORIES.personalCare, amount: -33.00, date: new Date(2025, 8, 22), labels: ['Wellness'] },
    ],
  },
  {
    date: new Date(2025, 8, 20),
    totalAmount: 3000.00,
    transactions: [
      { id: 74, category: CATEGORIES.salary, amount: 3000.00, date: new Date(2025, 8, 20), note: 'Monthly salary', labels: ['Income'] },
    ],
  },
  {
    date: new Date(2025, 8, 15),
    totalAmount: -218.50,
    transactions: [
      { id: 75, category: CATEGORIES.gym, amount: -60.00, date: new Date(2025, 8, 15), labels: ['Fitness'] },
      { id: 76, category: CATEGORIES.shopping, amount: -85.00, date: new Date(2025, 8, 15), labels: ['Shopping'] },
      { id: 77, category: CATEGORIES.groceries, amount: -55.00, date: new Date(2025, 8, 15), labels: ['Food'] },
      { id: 78, category: CATEGORIES.dining, amount: -18.50, date: new Date(2025, 8, 15), labels: ['Restaurant'] },
    ],
  },
  {
    date: new Date(2025, 8, 8),
    totalAmount: -172.80,
    transactions: [
      { id: 79, category: CATEGORIES.entertainment, amount: -62.00, date: new Date(2025, 8, 8), labels: ['Entertainment'] },
      { id: 80, category: CATEGORIES.transport, amount: -50.80, date: new Date(2025, 8, 8), labels: ['Commute'] },
      { id: 81, category: CATEGORIES.utilities, amount: -40.00, date: new Date(2025, 8, 8), labels: ['Bills'] },
      { id: 82, category: CATEGORIES.health, amount: -20.00, date: new Date(2025, 8, 8), labels: ['Medical'] },
    ],
  },
];
