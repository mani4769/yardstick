'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Budget } from '@/types';
import { getCurrentMonth } from '@/lib/utils';

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, '_id'>) => void;
  existingBudgets: Budget[];
}

export function BudgetForm({ onSubmit, existingBudgets }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: getCurrentMonth(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;
    
    setIsSubmitting(true);

    try {
      const budget = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: formData.month,
      };

      await onSubmit(budget);
      
      setFormData({
        category: '',
        amount: '',
        month: getCurrentMonth(),
      });
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExistingBudget = (category: string) => {
    return existingBudgets.find(b => b.category === category && b.month === formData.month);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Budget Amount (₹)</Label>
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
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => {
              setFormData({ ...formData, category: value });
              const existing = getExistingBudget(value);
              if (existing) {
                setFormData({ 
                  ...formData, 
                  category: value, 
                  amount: existing.amount.toString() 
                });
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => {
                  const existingBudget = getExistingBudget(category);
                  return (
                    <SelectItem key={category} value={category}>
                      {category} {existingBudget && `(Current: ₹${existingBudget.amount})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.category} 
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 
             getExistingBudget(formData.category) ? 'Update Budget' : 'Set Budget'}
          </Button>
        </form>

        {existingBudgets.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Current Budgets for {formData.month}:</h4>
            <div className="space-y-2">
              {existingBudgets
                .filter(b => b.month === formData.month)
                .map((budget) => (
                  <div key={budget.category} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{budget.category}</span>
                    <span className="font-medium">₹{budget.amount}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
