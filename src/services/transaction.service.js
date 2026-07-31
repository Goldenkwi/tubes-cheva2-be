const prisma = require('../config/database');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');

async function listTransactions({ page = 1, limit = 20, startDate, endDate, paymentStatus }) {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startOfDay(new Date(startDate));
    if (endDate) where.createdAt.lte = endOfDay(new Date(endDate));
  }
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const total = await prisma.transaction.count({ where });
  const transactions = await prisma.transaction.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          orderNumber: true,
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });

  return {
    data: transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function listMyTransactions(customerId, { page = 1, limit = 20 }) {
  const where = { order: { customerId } };
  const total = await prisma.transaction.count({ where });
  const transactions = await prisma.transaction.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalPrice: true,
          status: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  return {
    data: transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function payOrder(orderId, data, requester = null) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (requester && requester.customer && order.customerId !== requester.customer.id) {
    throw Object.assign(new Error('Anda tidak memiliki akses untuk membayar pesanan ini'), { statusCode: 403 });
  }

  const existing = await prisma.transaction.findUnique({ where: { orderId } });
  if (existing) throw Object.assign(new Error('Payment transaction already exists'), { statusCode: 409 });

  try {
    return await prisma.transaction.create({
      data: {
        orderId,
        amount: order.totalPrice,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        paymentProof: data.paymentProof,
        notes: data.notes,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw Object.assign(new Error('Payment transaction already exists'), { statusCode: 409 });
    }
    throw err;
  }
}

async function getDailyReport(date) {
  const day = date ? new Date(date) : new Date();
  const start = startOfDay(day);
  const end = endOfDay(day);

  const transactions = await prisma.transaction.findMany({
    where: {
      paymentStatus: 'PAID',
      paidAt: { gte: start, lte: end },
    },
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const byMethod = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
    return acc;
  }, {});

  return { date: day.toISOString().split('T')[0], totalRevenue, transactionCount: transactions.length, byMethod };
}

async function getMonthlyReport(year, month) {
  const date = new Date(year, month - 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const transactions = await prisma.transaction.findMany({
    where: {
      paymentStatus: 'PAID',
      paidAt: { gte: start, lte: end },
    },
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dailyRevenue = {};
  transactions.forEach((t) => {
    const day = t.paidAt.toISOString().split('T')[0];
    dailyRevenue[day] = (dailyRevenue[day] || 0) + t.amount;
  });

  return {
    year,
    month,
    totalRevenue,
    transactionCount: transactions.length,
    dailyRevenue,
  };
}

module.exports = { listTransactions, listMyTransactions, payOrder, getDailyReport, getMonthlyReport };

