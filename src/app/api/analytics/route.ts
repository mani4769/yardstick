import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getMonthDateRange, getBudgetStatus } from '@/lib/utils';
import { CategorySummary, CATEGORIES } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const { start, end } = getMonthDateRange(month);

    // Get budgets for the month
    const budgets = await db
      .collection('budgets')
      .find({ month })
      .toArray();

    // Get spending for the month by category
    const spendingPipeline = [
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ];

    const spending = await db
      .collection('transactions')
      .aggregate(spendingPipeline)
      .toArray();

    // Create category summary
    const categorySummary: CategorySummary[] = CATEGORIES.map(category => {
      const budget = budgets.find(b => b.category === category);
      const spent = spending.find(s => s._id === category);
      
      const budgetAmount = budget?.amount || 0;
      const spentAmount = spent?.totalSpent || 0;
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
    const totalSpent = spending.reduce((sum, item) => sum + item.totalSpent, 0);
    const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);

    // Get recent transactions
    const recentTransactions = await db
      .collection('transactions')
      .find({
        date: { $gte: start, $lte: end }
      })
      .sort({ date: -1 })
      .limit(10)
      .toArray();

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
