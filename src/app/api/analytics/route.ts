import { NextRequest, NextResponse } from 'next/server';
import { pool, initializeDatabase } from '@/lib/postgres';
import { getBudgetStatus } from '@/lib/utils';
import { CategorySummary, CATEGORIES } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split('-').map(Number);

    // Get budgets for the month
    const budgetQuery = 'SELECT category, amount FROM budgets WHERE month = $1';
    const budgetResult = await pool.query(budgetQuery, [month]);
    const budgets = budgetResult.rows;

    // Get spending for the month by category
    const spendingQuery = `
      SELECT category, SUM(amount) as total_spent
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
      GROUP BY category
    `;
    const spendingResult = await pool.query(spendingQuery, [year, monthNum]);
    const spending = spendingResult.rows;

    // Create category summary
    const categorySummary: CategorySummary[] = CATEGORIES.map(category => {
      const budget = budgets.find((b: { category: string; amount: string }) => b.category === category);
      const spent = spending.find((s: { category: string; total_spent: string }) => s.category === category);
      
      const budgetAmount = budget?.amount ? parseFloat(budget.amount) : 0;
      const spentAmount = spent?.total_spent ? parseFloat(spent.total_spent) : 0;
      const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
      const status = getBudgetStatus(spentAmount, budgetAmount);

      return {
        category,
        spent: spentAmount,
        budget: budgetAmount,
        percentage,
        status
      };
    });

    // Calculate total spent across all categories
    const totalSpent = spending.reduce((sum: number, item: { total_spent: string }) => sum + parseFloat(item.total_spent), 0);
    const totalBudget = budgets.reduce((sum: number, item: { amount: string }) => sum + parseFloat(item.amount), 0);

    // Get recent transactions
    const recentQuery = `
      SELECT id, amount, description, category, date, created_at
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
      ORDER BY date DESC, created_at DESC
      LIMIT 10
    `;
    const recentResult = await pool.query(recentQuery, [year, monthNum]);
    const recentTransactions = recentResult.rows.map((row: { id: number; amount: string; description: string; category: string; date: string; created_at: string }) => ({
      ...row,
      _id: row.id.toString()
    }));

    return NextResponse.json({
      categorySummary,
      totalSpent,
      totalBudget,
      recentTransactions,
      month
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
