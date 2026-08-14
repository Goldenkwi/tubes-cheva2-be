const prisma = require('../config/database');
const { startOfMonth, endOfMonth } = require('date-fns');
const { startOfDayWIB, endOfDayWIB } = require('../utils/datetime');

async function listExpenses({ page = 1, limit = 20, category, startDate, endDate }) {
  const where = {};
  if (category) where.category = category;
  if (startDate || endDate) {
    where.spentAt = {};
    if (startDate) where.spentAt.gte = startOfDayWIB(startDate);
    if (endDate) where.spentAt.lte = endOfDayWIB(endDate);
  }

  const total = await prisma.expense.count({ where });
  const expenses = await prisma.expense.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { spentAt: 'desc' },
  });

  return {
    data: expenses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getExpense(id) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  return expense;
}

async function createExpense(data, userId = null) {
  return prisma.expense.create({
    data: {
      category: data.category,
      amount: data.amount,
      source: data.source,
      description: data.description,
      receiptProof: data.receiptProof,
      spentAt: data.spentAt ? new Date(data.spentAt) : undefined,
      createdBy: userId,
    },
  });
}

async function updateExpense(id, data) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  return prisma.expense.update({
    where: { id },
    data: {
      ...data,
      spentAt: data.spentAt ? new Date(data.spentAt) : undefined,
    },
  });
}

async function deleteExpense(id) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  return prisma.expense.delete({ where: { id } });
}

async function getExpenseSummary(date) {
  const day = date ? new Date(date) : new Date();
  const monthStart = startOfMonth(day);
  const monthEnd = endOfMonth(day);

  const expenses = await prisma.expense.findMany({
    where: { spentAt: { gte: monthStart, lte: monthEnd } },
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return { totalExpense, count: expenses.length, byCategory };
}

module.exports = {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};
