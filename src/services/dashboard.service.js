const prisma = require('../config/database');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');
const { ORDER_STATUS } = require('../utils/constants');

async function getStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    activeOrders,
    todayOrders,
    monthTransactions,
    pendingPickup,
    inProgressOrders,
    readyOrders,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: { notIn: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.transaction.aggregate({
      where: {
        paymentStatus: 'PAID',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { status: ORDER_STATUS.PENDING } }),
    prisma.order.count({
      where: {
        status: { in: [ORDER_STATUS.WASHING, ORDER_STATUS.DRYING, ORDER_STATUS.IRONING, ORDER_STATUS.PACKING] },
      },
    }),
    prisma.order.count({ where: { status: ORDER_STATUS.READY } }),
    prisma.customer.count(),
  ]);

  return {
    activeOrders,
    todayOrders,
    monthlyRevenue: monthTransactions._sum.amount || 0,
    pendingPickup,
    inProgress: inProgressOrders,
    readyForPickup: readyOrders,
    totalCustomers,
  };
}

async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
}

async function getRevenueChart(year, month) {
  const date = new Date(year, month - 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const transactions = await prisma.transaction.findMany({
    where: {
      paymentStatus: 'PAID',
      paidAt: { gte: start, lte: end },
    },
    select: { amount: true, paidAt: true },
  });

  const chart = {};
  for (let d = 1; d <= new Date(year, month, 0).getDate(); d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    chart[key] = 0;
  }
  transactions.forEach((t) => {
    const key = t.paidAt.toISOString().split('T')[0];
    if (chart[key] !== undefined) chart[key] += t.amount;
  });

  return Object.entries(chart).map(([date, revenue]) => ({ date, revenue }));
}

module.exports = { getStats, getRecentOrders, getRevenueChart };
