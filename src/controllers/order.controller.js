const orderService = require('../services/order.service');
const response = require('../utils/response');

async function listOrders(req, res, next) {
  try {
    const { status, customerId, page, limit, startDate, endDate } = req.query;
    const result = await orderService.listOrders({
      status,
      customerId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      startDate,
      endDate,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function listMyOrders(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await orderService.listMyOrders(req.customer.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const requester = { user: req.user, customer: req.customer };
    const order = await orderService.getOrder(id, requester);
    return response.success(res, order);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const customerIdOverride = req.customer ? req.customer.id : null;
    const order = await orderService.createOrder(req.body, userId, customerIdOverride);
    return response.created(res, order, 'Pesanan berhasil dibuat');
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const order = await orderService.updateOrder(id, req.body);
    return response.success(res, order, 'Pesanan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;
    const order = await orderService.updateStatus(id, status, req.user.id, notes);
    return response.success(res, order, 'Status berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function trackOrder(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const order = await orderService.trackOrder(trackingToken);
    return response.success(res, order);
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, listMyOrders, getOrder, createOrder, updateOrder, updateStatus, trackOrder };

