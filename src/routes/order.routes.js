const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  orderIdParam,
  trackingTokenParam,
} = require('../validators/order.validator');

const router = Router();

router.get('/', authenticate, staffAndAbove, orderController.listOrders);
router.get('/tracking/:trackingToken', validate(trackingTokenParam), orderController.trackOrder);
router.get('/:id', authenticate, staffAndAbove, validate(orderIdParam), orderController.getOrder);
router.post('/', authenticate, staffAndAbove, validate(createOrderSchema), orderController.createOrder);
router.put('/:id', authenticate, staffAndAbove, validate(updateOrderSchema), orderController.updateOrder);
router.patch('/:id/status', authenticate, staffAndAbove, validate(updateStatusSchema), orderController.updateStatus);

module.exports = router;
