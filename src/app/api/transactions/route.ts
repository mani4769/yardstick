import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let query = {};
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      query = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const transactions = await db
      .collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .toArray();

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
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const transaction: Omit<Transaction, '_id'> = {
      amount: parseFloat(body.amount),
      description: body.description,
      category: body.category,
      date: new Date(body.date),
      createdAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transaction);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
