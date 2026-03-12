import { SymbolViewProps } from 'expo-symbols';

export type CategoryType = 'income' | 'expense';

export interface Category {
    id: number;
    name: string;
    icon: SymbolViewProps['name'];
    color: string;
    type: CategoryType;
}
