import { SymbolViewProps } from 'expo-symbols';

export interface Transaction {
  id: string;
  category: string;
  icon: SymbolViewProps['name'];
  amount: number;
  color?: string;
  date?: Date;
  note?: string;
  labels?: string[];
}

export interface TransactionSectionData {
  date: string;
  amount: string;
  transactions: Transaction[];
}
