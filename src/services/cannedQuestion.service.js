const prisma = require('../config/database');

async function listQuestions(activeOnly = true, category = null) {
  const where = {};
  if (activeOnly) where.isActive = true;
  if (category) where.category = category;

  return prisma.cannedQuestion.findMany({
    where,
    orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
  });
}

async function getQuestion(id, requester = null) {
  const question = await prisma.cannedQuestion.findUnique({ where: { id } });
  if (!question) {
    throw Object.assign(new Error('Canned question not found'), { statusCode: 404 });
  }

  const isStaffOrAdmin = requester && requester.user && (requester.user.role === 'ADMIN' || requester.user.role === 'STAFF');
  if (!question.isActive && !isStaffOrAdmin) {
    throw Object.assign(new Error('Canned question not found'), { statusCode: 404 });
  }

  return question;
}

async function createQuestion(data) {
  return prisma.cannedQuestion.create({
    data: {
      question: data.question,
      answer: data.answer,
      category: data.category || 'GENERAL',
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

async function updateQuestion(id, data) {
  await getQuestion(id);
  return prisma.cannedQuestion.update({
    where: { id },
    data,
  });
}

async function deactivateQuestion(id) {
  await getQuestion(id);
  return prisma.cannedQuestion.update({
    where: { id },
    data: { isActive: false },
  });
}

async function deleteQuestion(id) {
  await getQuestion(id);
  return prisma.cannedQuestion.delete({
    where: { id },
  });
}

async function askQuestion({ cannedQuestionId, userId = null, customerId = null, orderId = null, userIp = null }) {
  const canned = await prisma.cannedQuestion.findUnique({ where: { id: cannedQuestionId } });

  if (!canned || !canned.isActive) {
    throw Object.assign(new Error('Pertanyaan tidak ditemukan atau sudah tidak aktif'), { statusCode: 404 });
  }

  if (orderId) {
    const orderExists = await prisma.order.findUnique({ where: { id: orderId } });
    if (!orderExists) {
      throw Object.assign(new Error('Order tidak ditemukan'), { statusCode: 404 });
    }
  }

  if (customerId) {
    const customerExists = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customerExists) {
      throw Object.assign(new Error('Customer tidak ditemukan'), { statusCode: 404 });
    }
  }

  const history = await prisma.cannedQuestionHistory.create({
    data: {
      cannedQuestionId: canned.id,
      userId: userId || null,
      customerId: customerId || null,
      orderId: orderId || null,
      questionText: canned.question,
      answerText: canned.answer,
      userIp: userIp || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, phone: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });

  return {
    cannedQuestionId: canned.id,
    category: canned.category,
    question: canned.question,
    answer: canned.answer,
    historyId: history.id,
    askedAt: history.createdAt,
  };
}

async function getHistory({ page = 1, limit = 20, userId, customerId, cannedQuestionId }) {
  const where = {};
  if (userId) where.userId = parseInt(userId);
  if (customerId) where.customerId = parseInt(customerId);
  if (cannedQuestionId) where.cannedQuestionId = parseInt(cannedQuestionId);

  const total = await prisma.cannedQuestionHistory.count({ where });
  const data = await prisma.cannedQuestionHistory.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      cannedQuestion: { select: { id: true, category: true } },
      user: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, phone: true } },
      order: { select: { id: true, orderNumber: true, status: true } },
    },
  });

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
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
