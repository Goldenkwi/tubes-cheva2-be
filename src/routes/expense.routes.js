const { Router } = require('express');
const expenseController = require('../controllers/expense.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParam,
} = require('../validators/expense.validator');

const router = Router();

router.get('/summary', authenticate, staffAndAbove, expenseController.getSummary);
router.get('/', authenticate, staffAndAbove, expenseController.listExpenses);
router.get('/:id', authenticate, staffAndAbove, validate(expenseIdParam), expenseController.getExpense);
router.post('/', authenticate, staffAndAbove, validate(createExpenseSchema), expenseController.createExpense);
router.put('/:id', authenticate, staffAndAbove, validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', authenticate, staffAndAbove, validate(expenseIdParam), expenseController.deleteExpense);

module.exports = router;
