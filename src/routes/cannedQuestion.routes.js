const { Router } = require('express');
const cannedQuestionController = require('../controllers/cannedQuestion.controller');
const { authenticate, authenticateCustomerOrUser, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { quickReplyRateLimiter } = require('../middleware/rateLimiter');
const {
  createCannedQuestionSchema,
  updateCannedQuestionSchema,
  askCannedQuestionSchema,
  cannedQuestionIdParam,
} = require('../validators/cannedQuestion.validator');

const router = Router();

// Customer/User Endpoints (Requires Auth)
router.get('/', authenticateCustomerOrUser, cannedQuestionController.listQuestions);
router.post('/ask', authenticateCustomerOrUser, quickReplyRateLimiter, validate(askCannedQuestionSchema), cannedQuestionController.askQuestion);

// Admin audit history endpoint
router.get('/history', authenticate, adminOnly, cannedQuestionController.getHistory);

// Question detail & Admin CRUD endpoints
router.get('/:id', authenticateCustomerOrUser, validate(cannedQuestionIdParam), cannedQuestionController.getQuestion);
router.post('/', authenticate, adminOnly, validate(createCannedQuestionSchema), cannedQuestionController.createQuestion);
router.put('/:id', authenticate, adminOnly, validate(updateCannedQuestionSchema), cannedQuestionController.updateQuestion);
router.patch('/:id/deactivate', authenticate, adminOnly, validate(cannedQuestionIdParam), cannedQuestionController.deactivateQuestion);
router.delete('/:id', authenticate, adminOnly, validate(cannedQuestionIdParam), cannedQuestionController.deleteQuestion);

module.exports = router;
