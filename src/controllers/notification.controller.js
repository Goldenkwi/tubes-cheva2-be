const notificationService = require('../services/notification.service');
const response = require('../utils/response');

async function getMyNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getCustomerNotifications(req.customer.id);
    return response.success(res, notifications);
  } catch (err) {
    next(err);
  }
}

async function getCustomerNotifications(req, res, next) {
  try {
    const customerId = parseInt(req.params.customerId);
    const requester = { user: req.user, customer: req.customer };
    const notifications = await notificationService.getCustomerNotifications(customerId, requester);
    return response.success(res, notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const requester = { user: req.user, customer: req.customer };
    const notification = await notificationService.markAsRead(id, requester);
    return response.success(res, notification, 'Notifikasi ditandai sudah dibaca');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const customerId = req.customer ? req.customer.id : parseInt(req.params.customerId);
    const requester = { user: req.user, customer: req.customer };
    const result = await notificationService.markAllAsRead(customerId, requester);
    return response.success(res, result);
  } catch (err) {
    next(err);
  }
}

async function getMyUserNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return response.success(res, notifications);
  } catch (err) {
    next(err);
  }
}

async function markUserNotificationsAsRead(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return response.badRequest(res, 'ids harus berupa array yang tidak kosong');
    }
    const result = await notificationService.markUserNotificationsAsRead(req.user.id, ids.map(Number));
    return response.success(res, result, 'Notifikasi ditandai sudah dibaca');
  } catch (err) {
    next(err);
  }
}

async function deleteUserNotifications(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return response.badRequest(res, 'ids harus berupa array yang tidak kosong');
    }
    const result = await notificationService.deleteUserNotifications(req.user.id, ids.map(Number));
    return response.success(res, result, 'Notifikasi berhasil dihapus');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  getCustomerNotifications,
  markAsRead,
  markAllAsRead,
  getMyUserNotifications,
  markUserNotificationsAsRead,
  deleteUserNotifications,
};

