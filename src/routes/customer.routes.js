const { Router } = require('express');
const customerController = require('../controllers/customer.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCustomerSchema, updateCustomerSchema, customerIdParam } = require('../validators/customer.validator');

const router = Router();

router.get('/', authenticate, staffAndAbove, customerController.listCustomers);
router.get('/:id', authenticate, staffAndAbove, validate(customerIdParam), customerController.getCustomer);
router.post('/', authenticate, staffAndAbove, validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', authenticate, staffAndAbove, validate(updateCustomerSchema), customerController.updateCustomer);

module.exports = router;
