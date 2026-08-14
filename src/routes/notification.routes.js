const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authenticateCustomer, authenticateCustomerOrUser, staffAndAbove } = require('../middleware/auth');

const router = Router();

// Staff/Admin notification inbox (UserNotification model)
router.get('/', authenticate, staffAndAbove, notificationController.getMyUserNotifications);
router.patch('/mark-read', authenticate, staffAndAbove, notificationController.markUserNotificationsAsRead);
router.delete('/', authenticate, staffAndAbove, notificationController.deleteUserNotifications);

// Customer Specific Route
router.get('/my', authenticateCustomer, notificationController.getMyNotifications);

// Read notification endpoints
router.patch('/read-all', authenticateCustomer, notificationController.markAllAsRead);
router.patch('/:id/read', authenticateCustomerOrUser, notificationController.markAsRead);

// Customer notification list (by customerId - protected with dual auth and ownership check)
router.get('/:customerId', authenticateCustomerOrUser, notificationController.getCustomerNotifications);

module.exports = router;

