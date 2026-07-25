const prisma = require('../config/database');

async function getCustomerNotifications(customerId) {
  return prisma.notification.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      order: { select: { orderNumber: true } },
    },
  });
}

async function markAsRead(id) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

async function markAllAsRead(customerId) {
  await prisma.notification.updateMany({
    where: { customerId, isRead: false },
    data: { isRead: true },
  });
}

async function createNotification(data) {
  return prisma.notification.create({ data });
}

module.exports = { getCustomerNotifications, markAsRead, markAllAsRead, createNotification };
