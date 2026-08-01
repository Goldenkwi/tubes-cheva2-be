const transactionService = require('../services/transaction.service');
const response = require('../utils/response');

async function listTransactions(req, res, next) {
  try {
    const { page, limit, startDate, endDate, paymentStatus } = req.query;
    const result = await transactionService.listTransactions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      startDate,
      endDate,
      paymentStatus,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function listMyTransactions(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await transactionService.listMyTransactions(req.customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function payOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    const requester = { user: req.user, customer: req.customer };
    const transaction = await transactionService.payOrder(orderId, req.body, requester);
    return response.created(res, transaction, 'Pembayaran berhasil');
  } catch (err) {
    next(err);
  }
}

async function getDailyReport(req, res, next) {
  try {
    const report = await transactionService.getDailyReport(req.query.date);
    return response.success(res, report);
  } catch (err) {
    next(err);
  }
}

async function getMonthlyReport(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const report = await transactionService.getMonthlyReport(year, month);
    return response.success(res, report);
  } catch (err) {
    next(err);
  }
}

module.exports = { listTransactions, listMyTransactions, payOrder, getDailyReport, getMonthlyReport };

