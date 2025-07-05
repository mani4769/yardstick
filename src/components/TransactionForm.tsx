'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Transaction } from '@/types';
import { formatDate } from '@/lib/utils';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, '_id'>) => void;
  initialData?: Transaction;
  isEditing?: boolean;
}

export function TransactionForm({ onSubmit, initialData, isEditing = false }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    description: initialData?.description || '',
    category: initialData?.category || CATEGORIES[0],
    date: initialData?.date ? formatDate(new Date(initialData.date)) : formatDate(new Date()),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [day, month, year] = formData.date.split('/');
      const transaction = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
      };

      await onSubmit(transaction);
      
      if (!isEditing) {
        setFormData({
          amount: '',
          description: '',
          category: CATEGORIES[0],
          date: formatDate(new Date()),
        });
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.split('/').reverse().join('-')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData({ ...formData, date: formatDate(date) });
                }}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter transaction description"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
