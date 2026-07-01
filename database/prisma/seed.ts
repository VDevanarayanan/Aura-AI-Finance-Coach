import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing records (cascade handles dependencies)
  await prisma.user.deleteMany({});
  console.log('Cleaned database.');

  // 2. Create default user
  const email = 'test@example.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'John Doe',
      passwordHash: hashedPassword,
    },
  });
  console.log(`Created test user: ${user.email} (Password: password123)`);

  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1; // 1-indexed
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const prevMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
  const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear;
  const prevMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;

  // 3. Create Budgets for Current Month
  console.log(`Setting up budgets for ${currentMonthStr}...`);
  await prisma.budget.createMany({
    data: [
      { userId: user.id, month: currentMonthStr, category: 'Food', limitAmount: 10000 },
      { userId: user.id, month: currentMonthStr, category: 'Utilities', limitAmount: 5000 },
      { userId: user.id, month: currentMonthStr, category: 'Entertainment', limitAmount: 4000 },
      { userId: user.id, month: currentMonthStr, category: 'Shopping', limitAmount: 8000 },
      { userId: user.id, month: currentMonthStr, category: 'Travel', limitAmount: 3000 },
    ],
  });

  // 4. Create Savings Goals
  console.log('Setting up savings goals...');
  const targetDate1 = new Date();
  targetDate1.setMonth(targetDate1.getMonth() + 6); // 6 months from now
  const targetDate2 = new Date();
  targetDate2.setMonth(targetDate2.getMonth() + 3); // 3 months from now

  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: user.id,
        name: 'New MacBook Pro',
        targetAmount: 120000,
        currentAmount: 45000,
        targetDate: targetDate1,
      },
      {
        userId: user.id,
        name: 'Goa Vacation Trip',
        targetAmount: 30000,
        currentAmount: 15000,
        targetDate: targetDate2,
      },
    ],
  });

  // 5. Create Transactions
  console.log('Setting up transactions for current and previous months...');
  
  // Previous Month Transactions
  const prevTransactions = [
    {
      userId: user.id,
      title: 'Monthly Salary Credit',
      description: 'Salary credited ₹65,000',
      amount: 65000,
      type: 'INCOME',
      category: 'Salary',
      merchant: 'Tech Corp Inc',
      date: new Date(prevYear, prevMonthNum - 1, 1),
    },
    {
      userId: user.id,
      title: 'PG Rent Payment',
      description: 'Paid rent ₹15,000',
      amount: 15000,
      type: 'EXPENSE',
      category: 'Rent',
      merchant: 'Co-Living Spaces',
      date: new Date(prevYear, prevMonthNum - 1, 2),
    },
    {
      userId: user.id,
      title: 'Weekly Groceries',
      description: 'Groceries at super market ₹3,200',
      amount: 3200,
      type: 'EXPENSE',
      category: 'Food',
      merchant: 'D-Mart',
      date: new Date(prevYear, prevMonthNum - 1, 5),
    },
    {
      userId: user.id,
      title: 'Electricity Bill',
      description: 'Electricity bill payment ₹1,800',
      amount: 1800,
      type: 'EXPENSE',
      category: 'Utilities',
      merchant: 'State Electricity',
      date: new Date(prevYear, prevMonthNum - 1, 10),
    },
    {
      userId: user.id,
      title: 'Restaurant Dinner',
      description: 'Spent ₹2,500 on dinner with friends',
      amount: 2500,
      type: 'EXPENSE',
      category: 'Food',
      merchant: 'Spice Kitchen',
      date: new Date(prevYear, prevMonthNum - 1, 15),
    },
    {
      userId: user.id,
      title: 'Online Shopping clothes',
      description: 'Bought jeans and shirts ₹4,500',
      amount: 4500,
      type: 'EXPENSE',
      category: 'Shopping',
      merchant: 'Myntra',
      date: new Date(prevYear, prevMonthNum - 1, 22),
    },
  ];

  // Current Month Transactions
  const currentTransactions = [
    {
      userId: user.id,
      title: 'Monthly Salary Credit',
      description: 'Salary credited ₹65,000',
      amount: 65000,
      type: 'INCOME',
      category: 'Salary',
      merchant: 'Tech Corp Inc',
      date: new Date(currentYear, currentMonthNum - 1, 1),
    },
    {
      userId: user.id,
      title: 'PG Rent Payment',
      description: 'Paid rent ₹15,000',
      amount: 15000,
      type: 'EXPENSE',
      category: 'Rent',
      merchant: 'Co-Living Spaces',
      date: new Date(currentYear, currentMonthNum - 1, 2),
    },
    {
      userId: user.id,
      title: 'Electricity Bill',
      description: 'Paid electricity bill ₹1,200',
      amount: 1200,
      type: 'EXPENSE',
      category: 'Utilities',
      merchant: 'BESCOM',
      date: new Date(currentYear, currentMonthNum - 1, 4),
    },
    {
      userId: user.id,
      title: 'Pizza with Friends',
      description: 'I spent ₹1,500 on pizza',
      amount: 1500,
      type: 'EXPENSE',
      category: 'Food',
      merchant: 'Dominos Pizza',
      date: new Date(currentYear, currentMonthNum - 1, 8),
    },
    {
      userId: user.id,
      title: 'Cab ride to office',
      description: 'Uber ride ₹650',
      amount: 650,
      type: 'EXPENSE',
      category: 'Travel',
      merchant: 'Uber Cabs',
      date: new Date(currentYear, currentMonthNum - 1, 10),
    },
    {
      userId: user.id,
      title: 'Broadband Internet',
      description: 'Broadband wifi recharge ₹999',
      amount: 999,
      type: 'EXPENSE',
      category: 'Utilities',
      merchant: 'Airtel Fiber',
      date: new Date(currentYear, currentMonthNum - 1, 12),
    },
    {
      userId: user.id,
      title: 'Shopping at Shopping Mall',
      description: 'Bought a pair of shoes ₹3,200',
      amount: 3200,
      type: 'EXPENSE',
      category: 'Shopping',
      merchant: 'Nike',
      date: new Date(currentYear, currentMonthNum - 1, 18),
    },
    {
      userId: user.id,
      title: 'Movie Night ticket and snacks',
      description: 'Movie tickets ₹1,100',
      amount: 1100,
      type: 'EXPENSE',
      category: 'Entertainment',
      merchant: 'PVR Cinemas',
      date: new Date(currentYear, currentMonthNum - 1, 20),
    },
    {
      userId: user.id,
      title: 'Supermarket Groceries',
      description: 'Spent ₹2,800 on groceries',
      amount: 2800,
      type: 'EXPENSE',
      category: 'Food',
      merchant: 'Reliance Fresh',
      date: new Date(currentYear, currentMonthNum - 1, 25),
    },
  ];

  await prisma.transaction.createMany({
    data: [...prevTransactions, ...currentTransactions],
  });
  console.log(`Created ${prevTransactions.length + currentTransactions.length} test transactions.`);

  // 6. Create Chat History
  console.log('Setting up chat logs...');
  await prisma.chatHistory.createMany({
    data: [
      {
        userId: user.id,
        role: 'user',
        message: 'Hello, can you see my financial history?',
        createdAt: new Date(currentYear, currentMonthNum - 1, 28, 10, 0, 0),
      },
      {
        userId: user.id,
        role: 'assistant',
        message: 'Hello John! Yes, I have access to your budgets, savings goals, and recent transactions. It looks like you earn ₹65,000 monthly and have spent around ₹26,449 this month, leaving you with healthy net savings. How can I assist you with your budgeting today?',
        createdAt: new Date(currentYear, currentMonthNum - 1, 28, 10, 1, 0),
      },
    ],
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
