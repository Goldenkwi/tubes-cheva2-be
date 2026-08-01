const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authenticateCustomer, authenticateCustomerOrUser, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { payOrderSchema } = require('../validators/transaction.validator');

const router = Router();

// Customer Specific Transaction Route
router.get('/my-transactions', authenticateCustomer, transactionController.listMyTransactions);

// Admin Reports & Transaction List
router.get('/', authenticate, adminOnly, transactionController.listTransactions);
router.get('/report/daily', authenticate, adminOnly, transactionController.getDailyReport);
router.get('/report/monthly', authenticate, adminOnly, transactionController.getMonthlyReport);

// Dual Access Payment Route (Customer or Staff/Admin)
router.post('/:id/pay', authenticateCustomerOrUser, validate(payOrderSchema), transactionController.payOrder);

module.exports = router;
