import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const BUDGETS_FILE = path.join(DATA_DIR, 'budgets.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic file operations
async function readJsonFile(filePath: string) {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile(filePath: string, data: any) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Transaction operations
export async function getTransactions() {
  return await readJsonFile(TRANSACTIONS_FILE);
}

export async function addTransaction(transaction: any) {
  const transactions = await getTransactions();
  const newTransaction = {
    _id: Date.now().toString(),
    ...transaction,
    date: new Date(transaction.date),
    createdAt: new Date()
  };
  transactions.push(newTransaction);
  await writeJsonFile(TRANSACTIONS_FILE, transactions);
  return newTransaction;
}

export async function updateTransaction(id: string, updatedData: any) {
  const transactions = await getTransactions();
  const index = transactions.findIndex((t: any) => t._id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedData };
    await writeJsonFile(TRANSACTIONS_FILE, transactions);
    return transactions[index];
  }
  return null;
}

export async function deleteTransaction(id: string) {
  const transactions = await getTransactions();
  const filtered = transactions.filter((t: any) => t._id !== id);
  await writeJsonFile(TRANSACTIONS_FILE, filtered);
  return filtered;
}

// Budget operations
export async function getBudgets() {
  return await readJsonFile(BUDGETS_FILE);
}

export async function upsertBudget(budget: any) {
  const budgets = await getBudgets();
  const existingIndex = budgets.findIndex(
    (b: any) => b.category === budget.category && b.month === budget.month
  );
  
  const newBudget = {
    _id: existingIndex !== -1 ? budgets[existingIndex]._id : Date.now().toString(),
    ...budget,
    createdAt: existingIndex !== -1 ? budgets[existingIndex].createdAt : new Date(),
    updatedAt: new Date()
  };

  if (existingIndex !== -1) {
    budgets[existingIndex] = newBudget;
  } else {
    budgets.push(newBudget);
  }

  await writeJsonFile(BUDGETS_FILE, budgets);
  return newBudget;
}
