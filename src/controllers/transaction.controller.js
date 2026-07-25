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

async function payOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    const transaction = await transactionService.payOrder(orderId, req.body);
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

module.exports = { listTransactions, payOrder, getDailyReport, getMonthlyReport };
