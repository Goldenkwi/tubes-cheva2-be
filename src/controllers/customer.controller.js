const customerService = require('../services/customer.service');
const response = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await customerService.registerCustomer(req.body);
    return response.created(res, result, 'Pendaftaran akun pelanggan berhasil');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    const result = await customerService.loginCustomer(phone, password);
    return response.success(res, result, 'Login berhasil');
  } catch (err) {
    next(err);
  }
}

async function claimAccount(req, res, next) {
  try {
    const { phone, password } = req.body;
    const result = await customerService.claimAccount(phone, password);
    return response.success(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const customer = await customerService.getCustomerProfile(req.customer.id);
    return response.success(res, customer);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const customer = await customerService.updateCustomerProfile(req.customer.id, req.body);
    return response.success(res, customer, 'Profil berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

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

module.exports = {
  register,
  login,
  claimAccount,
  getProfile,
  updateProfile,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
};

