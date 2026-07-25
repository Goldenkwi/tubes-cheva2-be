const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate, adminOnly, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { payOrderSchema } = require('../validators/transaction.validator');

const router = Router();

router.get('/', authenticate, adminOnly, transactionController.listTransactions);
router.get('/report/daily', authenticate, adminOnly, transactionController.getDailyReport);
router.get('/report/monthly', authenticate, adminOnly, transactionController.getMonthlyReport);
router.post('/:id/pay', authenticate, staffAndAbove, validate(payOrderSchema), transactionController.payOrder);

module.exports = router;
