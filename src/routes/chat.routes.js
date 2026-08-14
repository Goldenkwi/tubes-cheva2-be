const { Router } = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate, authenticateCustomer, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { replySchema, customerMessageSchema } = require('../validators/chat.validator');

const router = Router();

// Staff/Admin side
router.get('/conversations', authenticate, staffAndAbove, chatController.listConversations);
router.get('/conversations/:id', authenticate, staffAndAbove, chatController.getConversation);
router.post('/conversations/:id/reply', authenticate, staffAndAbove, validate(replySchema), chatController.replyToConversation);

// Customer side (future customer app)
router.post('/conversations', authenticateCustomer, validate(customerMessageSchema), chatController.sendCustomerMessage);

module.exports = router;
