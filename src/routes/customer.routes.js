const { Router } = require('express');
const customerController = require('../controllers/customer.controller');
const { authenticate, authenticateCustomer, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerCustomerSchema,
  loginCustomerSchema,
  claimAccountSchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParam,
} = require('../validators/customer.validator');

const router = Router();

// Public Customer Auth Routes
router.post('/register', validate(registerCustomerSchema), customerController.register);
router.post('/login', validate(loginCustomerSchema), customerController.login);
router.post('/claim-account', validate(claimAccountSchema), customerController.claimAccount);

// Protected Customer Profile Routes
router.get('/me', authenticateCustomer, customerController.getProfile);
router.put('/me', authenticateCustomer, customerController.updateProfile);

// Staff/Admin Customer Management Routes
router.get('/', authenticate, staffAndAbove, customerController.listCustomers);
router.get('/:id', authenticate, staffAndAbove, validate(customerIdParam), customerController.getCustomer);
router.post('/', authenticate, staffAndAbove, validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', authenticate, staffAndAbove, validate(updateCustomerSchema), customerController.updateCustomer);

module.exports = router;

