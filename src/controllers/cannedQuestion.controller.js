const cannedQuestionService = require('../services/cannedQuestion.service');
const response = require('../utils/response');

async function listQuestions(req, res, next) {
  try {
    const isStaffOrAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF');
    const activeOnly = isStaffOrAdmin ? (req.query.all !== 'true') : true;
    const category = req.query.category || null;
    const questions = await cannedQuestionService.listQuestions(activeOnly, category);
    return response.success(res, questions);
  } catch (err) {
    next(err);
  }
}

async function getQuestion(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const requester = { user: req.user, customer: req.customer };
    const question = await cannedQuestionService.getQuestion(id, requester);
    return response.success(res, question);
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const question = await cannedQuestionService.createQuestion(req.body);
    return response.created(res, question, 'Pertanyaan berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const question = await cannedQuestionService.updateQuestion(id, req.body);
    return response.success(res, question, 'Pertanyaan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function deactivateQuestion(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const question = await cannedQuestionService.deactivateQuestion(id);
    return response.success(res, question, 'Pertanyaan berhasil dinonaktifkan');
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await cannedQuestionService.deleteQuestion(id);
    return response.success(res, null, 'Pertanyaan berhasil dihapus');
  } catch (err) {
    next(err);
  }
}

async function askQuestion(req, res, next) {
  try {
    const { cannedQuestionId, orderId } = req.body;
    const customerId = req.customer ? req.customer.id : req.body.customerId;
    const userId = req.user ? req.user.id : null;
    const userIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await cannedQuestionService.askQuestion({
      cannedQuestionId,
      userId,
      customerId,
      orderId,
      userIp,
    });

    return response.success(res, result, 'Jawaban otomatis berhasil didapatkan');
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const { page, limit, userId, customerId, cannedQuestionId } = req.query;
    const result = await cannedQuestionService.getHistory({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      userId,
      customerId,
      cannedQuestionId,
    });

    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deactivateQuestion,
  deleteQuestion,
  askQuestion,
  getHistory,
};
