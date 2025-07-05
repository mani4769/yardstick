'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CategorySummary } from '@/types';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface InsightCardsProps {
  data: CategorySummary[];
  totalSpent: number;
  totalBudget: number;
}

export function InsightCards({ data, totalSpent, totalBudget }: InsightCardsProps) {
  const overBudgetCategories = data.filter(item => item.status === 'over');
  const warningCategories = data.filter(item => item.status === 'warning');
  const safeCategories = data.filter(item => item.status === 'safe' && item.budget > 0);

  const totalBudgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spending Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            of {formatCurrency(totalBudget)} budget
          </p>
          <Progress value={totalBudgetUsed} className="mt-2" />
          <p className="text-xs mt-1">
            {totalBudgetUsed.toFixed(1)}% of total budget used
          </p>
        </CardContent>
      </Card>

      {/* Over Budget Alert */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overBudgetCategories.length}</div>
          <p className="text-xs text-muted-foreground">
            {overBudgetCategories.length === 1 ? 'category' : 'categories'}
          </p>
          {overBudgetCategories.length > 0 && (
            <div className="mt-2 space-y-1">
              {overBudgetCategories.slice(0, 2).map((category) => (
                <div key={category.category} className="text-xs">
                  <Badge variant="destructive" className="text-xs">
                    {category.category}: {category.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Close to Limit</CardTitle>
          <TrendingDown className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{warningCategories.length}</div>
          <p className="text-xs text-muted-foreground">
            {warningCategories.length === 1 ? 'category' : 'categories'}
          </p>
          {warningCategories.length > 0 && (
            <div className="mt-2 space-y-1">
              {warningCategories.slice(0, 2).map((category) => (
                <div key={category.category} className="text-xs">
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {category.category}: {category.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safe Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On Track</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{safeCategories.length}</div>
          <p className="text-xs text-muted-foreground">
            {safeCategories.length === 1 ? 'category' : 'categories'}
          </p>
          {safeCategories.length > 0 && (
            <div className="mt-2 space-y-1">
              {safeCategories.slice(0, 2).map((category) => (
                <div key={category.category} className="text-xs">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {category.category}: {category.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Category Insights */}
      {data.filter(item => item.budget > 0).map((category) => (
        <Card key={category.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
            <Badge className={getStatusColor(category.status)}>
              {category.status === 'over' ? 'Over' : 
               category.status === 'warning' ? 'Warning' : 'Safe'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(category.spent)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(category.budget)} budget
            </p>
            <Progress 
              value={Math.min(100, category.percentage)} 
              className="mt-2"
            />
            <p className="text-xs mt-1">
              {category.percentage.toFixed(1)}% used
              {category.percentage > 100 && (
                <span className="text-red-500 ml-1">
                  (₹{formatCurrency(category.spent - category.budget)} over)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
