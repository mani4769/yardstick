import { NextRequest, NextResponse } from 'next/server';
import { pool, initializeDatabase } from '@/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let query = 'SELECT id, amount, description, category, date, created_at FROM transactions';
    let params: (string | number)[] = [];
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      query += ' WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2';
      params = [year, monthNum];
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Convert id to _id for frontend compatibility
    const transactions = result.rows.map((row: { id: number; amount: string; description: string; category: string; date: string; created_at: string }) => ({
      ...row,
      _id: row.id.toString(),
    }));

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
    // Initialize database tables on first request
    await initializeDatabase();
    
    const body = await request.json();
    
    const query = `
      INSERT INTO transactions (amount, description, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, amount, description, category, date, created_at
    `;
    
    const values = [
      parseFloat(body.amount),
      body.description,
      body.category,
      new Date(body.date).toISOString().split('T')[0]
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      transaction: {
        ...result.rows[0],
        _id: result.rows[0].id.toString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
