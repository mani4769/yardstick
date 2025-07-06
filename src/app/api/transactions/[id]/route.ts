import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const query = `
      UPDATE transactions 
      SET amount = $1, description = $2, category = $3, date = $4
      WHERE id = $5
      RETURNING id, amount, description, category, date, created_at
    `;
    
    const values = [
      parseFloat(body.amount),
      body.description,
      body.category,
      new Date(body.date).toISOString().split('T')[0],
      parseInt(id)
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      transaction: {
        ...result.rows[0],
        _id: result.rows[0].id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const query = 'DELETE FROM transactions WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
