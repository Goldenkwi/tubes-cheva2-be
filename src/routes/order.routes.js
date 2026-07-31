const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate, authenticateCustomer, authenticateCustomerOrUser, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  orderIdParam,
  trackingTokenParam,
} = require('../validators/order.validator');

const router = Router();

// Public Order Tracking
router.get('/tracking/:trackingToken', validate(trackingTokenParam), orderController.trackOrder);

// Customer Specific Orders Route
router.get('/my-orders', authenticateCustomer, orderController.listMyOrders);

// Dual Access Orders Routes (Customer or Staff/Admin)
router.get('/:id', authenticateCustomerOrUser, validate(orderIdParam), orderController.getOrder);
router.post('/', authenticateCustomerOrUser, validate(createOrderSchema), orderController.createOrder);

// Staff/Admin Management Routes
router.get('/', authenticate, staffAndAbove, orderController.listOrders);
router.put('/:id', authenticate, staffAndAbove, validate(updateOrderSchema), orderController.updateOrder);
router.patch('/:id/status', authenticate, staffAndAbove, validate(updateStatusSchema), orderController.updateStatus);

module.exports = router;

