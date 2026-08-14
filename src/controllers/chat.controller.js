const chatService = require('../services/chat.service');
const response = require('../utils/response');

async function listConversations(req, res, next) {
  try {
    const conversations = await chatService.listConversations();
    return response.success(res, conversations);
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const conversation = await chatService.getConversation(id);
    return response.success(res, conversation);
  } catch (err) {
    next(err);
  }
}

async function replyToConversation(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const message = await chatService.replyToConversation(id, req.user.id, req.body.body);
    return response.created(res, message, 'Balasan terkirim');
  } catch (err) {
    next(err);
  }
}

async function sendCustomerMessage(req, res, next) {
  try {
    const result = await chatService.sendCustomerMessage({
      customerId: req.customer.id,
      orderId: req.body.orderId || null,
      body: req.body.body,
    });
    return response.created(res, result, 'Pesan terkirim');
  } catch (err) {
    next(err);
  }
}

module.exports = { listConversations, getConversation, replyToConversation, sendCustomerMessage };
