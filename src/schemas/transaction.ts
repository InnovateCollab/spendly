export interface Transaction {
  id: string;
  category: string;
  amount: number;
  date: Date;
  note?: string;
  labels?: string[];
}

export interface DailyTransactions {
  date: Date;
  totalAmount: number;
  transactions: Transaction[];
}
