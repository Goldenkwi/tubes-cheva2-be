const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authenticateCustomer, authenticateCustomerOrUser, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { payOrderSchema } = require('../validators/transaction.validator');

const router = Router();

// Customer Specific Transaction Route
router.get('/my-transactions', authenticateCustomer, transactionController.listMyTransactions);

// Staff/Admin Reports & Transaction List
router.get('/', authenticate, staffAndAbove, transactionController.listTransactions);
router.get('/report/daily', authenticate, staffAndAbove, transactionController.getDailyReport);
router.get('/report/monthly', authenticate, staffAndAbove, transactionController.getMonthlyReport);

// Dual Access Payment Route (Customer or Staff/Admin)
router.post('/:id/pay', authenticateCustomerOrUser, validate(payOrderSchema), transactionController.payOrder);

module.exports = router;
