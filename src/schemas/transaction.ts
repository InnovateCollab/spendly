import { Category } from './category';

export interface Transaction {
  id: number;
  categoryId: number;
  amount: number;
  date: Date;
  note?: string;
  labels?: string[];
}

// Display format with full category object (used in UI)
export interface TransactionUI {
  id: number;
  category: Category;
  amount: number;
  date: Date;
  note?: string;
  labels?: string[];
}

export interface DailyTransactions {
  date: Date;
  totalAmount: number;
  transactions: TransactionUI[];
}
