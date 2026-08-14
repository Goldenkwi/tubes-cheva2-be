const prisma = require('../config/database');
const { notifyAllStaff } = require('./notification.service');

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

// Map a conversation (with customer/order/messages loaded) into the shape the
// FE ChatList / ChatDetailPanel expect.
function toListItem(conversation) {
  const messages = conversation.messages || [];
  const last = messages[0] || null;
  const lastCustomer = messages.find((m) => m.senderType === 'CUSTOMER') || null;

  return {
    id: conversation.id,
    name: conversation.customer ? conversation.customer.name : null,
    role: 'Pelanggan',
    time: last ? formatTime(last.createdAt) : null,
    lastMessage: last ? last.body : null,
    replied: last ? last.senderType === 'STAFF' : false,
    trxId: conversation.order ? conversation.order.orderNumber : null,
    date: lastCustomer ? formatDate(lastCustomer.createdAt) : null,
    question: lastCustomer ? lastCustomer.body : null,
    questionTime: lastCustomer ? formatTime(lastCustomer.createdAt) : null,
  };
}

async function listConversations() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: { select: { id: true, name: true } },
      order: { select: { orderNumber: true } },
      messages: { orderBy: { createdAt: 'desc' } },
    },
  });

  return conversations.map(toListItem);
}

async function getConversation(id) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      order: { select: { orderNumber: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!conversation) throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });

  return {
    ...toListItem({ ...conversation, messages: [...conversation.messages].reverse() }),
    messages: conversation.messages,
  };
}

async function replyToConversation(id, userId, body) {
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });

  const message = await prisma.message.create({
    data: { conversationId: id, senderType: 'STAFF', senderUserId: userId, body },
  });
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return message;
}

// Customer starts a new conversation or continues an existing one.
async function sendCustomerMessage({ customerId, orderId = null, body }) {
  let conversation = await prisma.conversation.findFirst({
    where: { customerId, ...(orderId ? { orderId } : {}) },
    orderBy: { updatedAt: 'desc' },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { customerId, orderId } });
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderType: 'CUSTOMER', body },
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

  await notifyAllStaff('CUSTOMER_CHAT', 'Pesan Baru', body.length > 120 ? `${body.slice(0, 120)}…` : body);

  return { conversationId: conversation.id, message };
}

module.exports = { listConversations, getConversation, replyToConversation, sendCustomerMessage };
