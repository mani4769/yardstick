import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/fileStorage';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let transactions = await getTransactions();
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, monthNum - 1));
      const endDate = endOfMonth(new Date(year, monthNum - 1));
      
      transactions = transactions.filter((t: { date: string }) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Sort by date descending
    transactions.sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const transaction = {
      amount: parseFloat(body.amount),
      description: body.description,
      category: body.category,
      date: new Date(body.date),
    };

    const result = await addTransaction(transaction);
    
    return NextResponse.json({ 
      success: true, 
      id: result._id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
