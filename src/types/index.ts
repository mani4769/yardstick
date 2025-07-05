export interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt?: Date;
}

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategorySummary {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  status: 'over' | 'warning' | 'safe';
}

export const CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Travel',
  'Rent',
  'Groceries',
  'Utilities',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
