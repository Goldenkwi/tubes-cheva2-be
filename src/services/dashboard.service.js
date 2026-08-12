const prisma = require('../config/database');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } = require('date-fns');
const { ORDER_STATUS } = require('../utils/constants');

// Percentage change vs previous period, rounded. Returns 0 when there is no
// prior value to avoid division by zero / Infinity.
function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterday = subDays(now, 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const inProgressStatuses = [ORDER_STATUS.WASHING, ORDER_STATUS.DRYING, ORDER_STATUS.IRONING];

  const [
    activeOrders,
    todayOrders,
    monthTransactions,
    todayRevenueAgg,
    yesterdayRevenueAgg,
    readyOrders,
    readyYesterday,
    inProgressOrders,
    inProgressYesterday,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: { notIn: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] } },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.transaction.aggregate({
      where: { paymentStatus: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { paymentStatus: 'PAID', paidAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { paymentStatus: 'PAID', paidAt: { gte: yesterdayStart, lte: yesterdayEnd } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { status: ORDER_STATUS.READY } }),
    prisma.order.count({
      where: { status: ORDER_STATUS.READY, updatedAt: { gte: yesterdayStart, lte: yesterdayEnd } },
    }),
    prisma.order.count({ where: { status: { in: inProgressStatuses } } }),
    prisma.order.count({
      where: { status: { in: inProgressStatuses }, updatedAt: { gte: yesterdayStart, lte: yesterdayEnd } },
    }),
    prisma.customer.count(),
  ]);

  const todayRevenue = todayRevenueAgg._sum.amount || 0;
  const yesterdayRevenue = yesterdayRevenueAgg._sum.amount || 0;
  const yesterdayOrdersCount = await prisma.order.count({
    where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
  });

  return {
    // Figma dashboard cards (with % change vs kemarin)
    totalOrders: { value: todayOrders, change: percentChange(todayOrders, yesterdayOrdersCount) },
    readyForPickup: { value: readyOrders, change: percentChange(readyOrders, readyYesterday) },
    inProgress: { value: inProgressOrders, change: percentChange(inProgressOrders, inProgressYesterday) },
    todayRevenue: { value: todayRevenue, change: percentChange(todayRevenue, yesterdayRevenue) },

    // Backward-compatible flat fields (existing FE)
    activeOrders,
    todayOrders,
    monthlyRevenue: monthTransactions._sum.amount || 0,
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
