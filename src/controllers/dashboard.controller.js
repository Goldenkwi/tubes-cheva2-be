const dashboardService = require('../services/dashboard.service');
const response = require('../utils/response');

async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getStats();
    return response.success(res, stats);
  } catch (err) {
    next(err);
  }
}

async function getRecentOrders(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await dashboardService.getRecentOrders(limit);
    return response.success(res, orders);
  } catch (err) {
    next(err);
  }
}

async function getRevenueChart(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const chart = await dashboardService.getRevenueChart(year, month);
    return response.success(res, chart);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRecentOrders, getRevenueChart };
