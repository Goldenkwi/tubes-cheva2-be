const { Router } = require('express');
const expenseController = require('../controllers/expense.controller');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParam,
} = require('../validators/expense.validator');

const router = Router();

router.get('/summary', authenticate, adminOnly, expenseController.getSummary);
router.get('/', authenticate, adminOnly, expenseController.listExpenses);
router.get('/:id', authenticate, adminOnly, validate(expenseIdParam), expenseController.getExpense);
router.post('/', authenticate, adminOnly, validate(createExpenseSchema), expenseController.createExpense);
router.put('/:id', authenticate, adminOnly, validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', authenticate, adminOnly, validate(expenseIdParam), expenseController.deleteExpense);

module.exports = router;
