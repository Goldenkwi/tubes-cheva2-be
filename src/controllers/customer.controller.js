const customerService = require('../services/customer.service');
const response = require('../utils/response');

async function listCustomers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await customerService.listCustomers({
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function getCustomer(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const customer = await customerService.getCustomer(id);
    return response.success(res, customer);
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body);
    return response.created(res, customer, 'Pelanggan berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const customer = await customerService.updateCustomer(id, req.body);
    return response.success(res, customer, 'Pelanggan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer };
