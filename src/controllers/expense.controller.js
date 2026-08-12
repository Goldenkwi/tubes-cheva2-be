const expenseService = require('../services/expense.service');
const response = require('../utils/response');

async function listExpenses(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { category, startDate, endDate } = req.query;
    const result = await expenseService.listExpenses({ page, limit, category, startDate, endDate });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function getExpense(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpense(id);
    return response.success(res, expense);
  } catch (err) {
    next(err);
  }
}

async function createExpense(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const expense = await expenseService.createExpense(req.body, userId);
    return response.created(res, expense, 'Pengeluaran berhasil dicatat');
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const expense = await expenseService.updateExpense(id, req.body);
    return response.success(res, expense, 'Pengeluaran berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await expenseService.deleteExpense(id);
    return response.success(res, null, 'Pengeluaran berhasil dihapus');
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await expenseService.getExpenseSummary(req.query.date);
    return response.success(res, summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense, getSummary };
