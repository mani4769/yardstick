import { NextRequest, NextResponse } from 'next/server';
import { pool, initializeDatabase } from '@/lib/postgres';

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

    const query = 'SELECT id, category, amount, month, created_at, updated_at FROM budgets WHERE month = $1';
    const result = await pool.query(query, [month]);
    
    // Convert id to _id for frontend compatibility
    const budgets = result.rows.map((row: any) => ({
      ...row,
      _id: row.id.toString(),
    }));

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
    // Initialize database tables on first request
    await initializeDatabase();
    
    const body = await request.json();
    
    const query = `
      INSERT INTO budgets (category, amount, month, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (category, month)
      DO UPDATE SET 
        amount = EXCLUDED.amount,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, category, amount, month, created_at, updated_at
    `;
    
    const values = [
      body.category,
      parseFloat(body.amount),
      body.month
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      budget: {
        ...result.rows[0],
        _id: result.rows[0].id.toString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
}
