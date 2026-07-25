const notificationService = require('../services/notification.service');
const response = require('../utils/response');

async function getCustomerNotifications(req, res, next) {
  try {
    const customerId = parseInt(req.params.customerId);
    const notifications = await notificationService.getCustomerNotifications(customerId);
    return response.success(res, notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const notification = await notificationService.markAsRead(id);
    return response.success(res, notification, 'Notifikasi ditandai sudah dibaca');
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomerNotifications, markAsRead };
