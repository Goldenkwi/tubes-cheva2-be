const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');

const router = Router();

router.get('/:customerId', authenticate, staffAndAbove, notificationController.getCustomerNotifications);
router.patch('/:id/read', authenticate, staffAndAbove, notificationController.markAsRead);

module.exports = router;
