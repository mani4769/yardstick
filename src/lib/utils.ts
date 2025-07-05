import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthDateRange(monthStr: string): { start: Date; end: Date } {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getBudgetStatus(spent: number, budget: number): 'over' | 'warning' | 'safe' {
  const percentage = (spent / budget) * 100;
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  return 'safe';
}

export function getStatusColor(status: 'over' | 'warning' | 'safe'): string {
  switch (status) {
    case 'over':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'safe':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
