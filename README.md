# Personal Finance Tracker

A comprehensive web application to track personal finances with budgeting capabilities, spending insights, and beautiful data visualizations.

## Features

### ✅ Stage 3: Budgeting (Current Implementation)

- **Transaction Management**: Add, edit, and delete transactions with categories
- **Monthly Budgeting**: Set and manage budgets per category
- **Budget vs Actual Comparison**: Visual charts showing budget performance
- **Spending Insights**: Smart categorization of spending patterns
- **Interactive Dashboard**: Beautiful charts and progress indicators
- **Real-time Analytics**: Automatic calculation of budget status

### Key Components

- **Transaction Tracking**: Form-based transaction entry with validation
- **Category Management**: Predefined categories for consistent tracking
- **Budget Setting**: Monthly budget allocation per category
- **Visual Analytics**: 
  - Pie charts for category spending breakdown
  - Bar charts for budget vs actual comparison
  - Progress bars for budget utilization
  - Insight cards with status indicators

### Spending Insights

- 🚨 **Over Budget**: Categories exceeding allocated budget (highlighted in red)
- ⚠️ **Close to Limit**: Categories at 80%+ of budget (highlighted in yellow)
- ✅ **On Track**: Categories within safe spending limits (highlighted in green)
- 📊 **Monthly Analysis**: Automatic budget vs actual calculations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: shadcn/ui components
- **Charts**: Recharts for data visualization
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

### 1. Clone and Install

```bash
git clone <repository-url>
cd yardstick
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/finance-tracker
MONGODB_DB=finance-tracker
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance-tracker
MONGODB_DB=finance-tracker
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env.local`

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to see the application.

## Usage Guide

### Dashboard Overview

The main dashboard provides:
- **Summary Cards**: Total spending, over-budget categories, warnings, and safe categories
- **Visual Charts**: Pie chart for category breakdown, bar chart for budget comparison
- **Recent Transactions**: Latest transaction activity

### Managing Transactions

1. **Add Transaction**: Use the transaction form to add new expenses
2. **Edit Transaction**: Click edit button in the transaction table
3. **Delete Transaction**: Click delete button to remove transactions
4. **Filter by Month**: Use the month selector to view specific periods

### Setting Budgets

1. **Monthly Budgets**: Set budgets for each category per month
2. **Budget Updates**: Modify existing budgets as needed
3. **Visual Feedback**: See real-time budget utilization
4. **Status Indicators**: Color-coded budget status

### Understanding Insights

- **Red Status**: Over budget - immediate attention needed
- **Yellow Status**: Close to limit - monitor spending
- **Green Status**: On track - healthy spending pattern
- **Progress Bars**: Visual representation of budget utilization

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions?month=YYYY-MM` - Get transactions for specific month
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Budgets
- `GET /api/budgets?month=YYYY-MM` - Get budgets for specific month
- `POST /api/budgets` - Create/update budget

### Analytics
- `GET /api/analytics?month=YYYY-MM` - Get comprehensive analytics data

## Database Schema

### Transactions Collection
```javascript
{
  _id: ObjectId,
  amount: Number,
  description: String,
  category: String,
  date: Date,
  createdAt: Date
}
```

### Budgets Collection
```javascript
{
  _id: ObjectId,
  category: String,
  amount: Number,
  month: String, // Format: YYYY-MM
  createdAt: Date,
  updatedAt: Date
}
```

## Categories

Pre-defined categories include:
- Food, Transportation, Entertainment, Shopping
- Bills, Healthcare, Education, Travel
- Rent, Groceries, Utilities, Other

## Future Enhancements

- 🔐 User authentication and multi-user support
- 📱 Mobile responsive design improvements
- 📈 Advanced analytics and reporting
- 🏷️ Custom category creation
- 📧 Budget alert notifications
- 💰 Income tracking
- 🔄 Recurring transactions
- 📊 Year-over-year comparisons

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify**: Configure build settings
- **Railway**: Database and app deployment
- **Heroku**: With MongoDB Atlas

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review API endpoints

---

Built with ❤️ using Next.js and MongoDB
