import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Budget } from '@/types';

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

    const budgets = await db
      .collection('budgets')
      .find({ month })
      .toArray();

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const budget: Omit<Budget, '_id'> = {
      category: body.category,
      amount: parseFloat(body.amount),
      month: body.month,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert budget (update if exists, insert if not)
    const result = await db.collection('budgets').replaceOne(
      { category: budget.category, month: budget.month },
      budget,
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      id: result.upsertedId || 'updated' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
}
