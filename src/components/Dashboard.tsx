'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionTable } from '@/components/TransactionTable';
import { BudgetForm } from '@/components/BudgetForm';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { BudgetComparisonChart } from '@/components/BudgetComparisonChart';
import { InsightCards } from '@/components/InsightCards';
import { Transaction, Budget, CategorySummary } from '@/types';
import { getCurrentMonth } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface AnalyticsData {
  categorySummary: CategorySummary[];
  totalSpent: number;
  totalBudget: number;
  recentTransactions: Transaction[];
  month: string;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch data functions
  const fetchTransactions = useCallback(async (month?: string) => {
    try {
      const url = month ? `/api/transactions?month=${month}` : '/api/transactions';
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  }, []);

  const fetchBudgets = useCallback(async (month: string) => {
    try {
      const response = await fetch(`/api/budgets?month=${month}`);
      const data = await response.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    }
  }, []);

  const fetchAnalytics = useCallback(async (month: string) => {
    try {
      const response = await fetch(`/api/analytics?month=${month}`);
      const data = await response.json();
      setAnalytics(data || { categorySummary: [], totalSpent: 0, totalBudget: 0, recentTransactions: [], month });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({ categorySummary: [], totalSpent: 0, totalBudget: 0, recentTransactions: [], month });
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchTransactions(selectedMonth),
      fetchBudgets(selectedMonth),
      fetchAnalytics(selectedMonth),
    ]);
    setLoading(false);
  }, [selectedMonth, fetchTransactions, fetchBudgets, fetchAnalytics]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Transaction handlers
  const handleAddTransaction = async (transaction: Omit<Transaction, '_id'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleEditTransaction = async (transaction: Omit<Transaction, '_id'>) => {
    if (!editingTransaction?._id) return;

    try {
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        setEditingTransaction(null);
        await refreshData();
      }
    } catch (error) {
      console.error('Error editing transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Budget handlers
  const handleAddBudget = async (budget: Omit<Budget, '_id'>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Personal Finance Tracker</h1>
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="month">Select Month</Label>
            <Input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Simple Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'transactions', 'budgets'].map((tab) => (
            <button
              key={tab}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && analytics && (
          <>
            <InsightCards 
              data={analytics.categorySummary}
              totalSpent={analytics.totalSpent}
              totalBudget={analytics.totalBudget}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart data={analytics.categorySummary} />
              <BudgetComparisonChart data={analytics.categorySummary} />
            </div>

            <TransactionTable 
              transactions={analytics.recentTransactions}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
            />
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransactionForm 
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                initialData={editingTransaction || undefined}
                isEditing={!!editingTransaction}
              />
              {editingTransaction && (
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingTransaction(null)}
                  >
                    Cancel Edit
                  </Button>
                </div>
              )}
            </div>
            
            <TransactionTable 
              transactions={transactions}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
            />
          </>
        )}

        {activeTab === 'budgets' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetForm 
                onSubmit={handleAddBudget}
                existingBudgets={budgets}
              />
              
              {analytics && (
                <BudgetComparisonChart data={analytics.categorySummary} />
              )}
            </div>

            {analytics && (
              <InsightCards 
                data={analytics.categorySummary}
                totalSpent={analytics.totalSpent}
                totalBudget={analytics.totalBudget}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
