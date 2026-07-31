const prisma = require('../config/database');

async function getCustomerNotifications(customerId, requester = null) {
  if (requester && requester.customer && requester.customer.id !== customerId) {
    throw Object.assign(new Error('Anda tidak memiliki akses ke notifikasi ini'), { statusCode: 403 });
  }

  return prisma.notification.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      order: { select: { orderNumber: true } },
    },
  });
}

async function markAsRead(id, requester = null) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });

  if (requester && requester.customer && notification.customerId !== requester.customer.id) {
    throw Object.assign(new Error('Anda tidak memiliki akses ke notifikasi ini'), { statusCode: 403 });
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

async function markAllAsRead(customerId, requester = null) {
  if (requester && requester.customer && requester.customer.id !== customerId) {
    throw Object.assign(new Error('Anda tidak memiliki akses ke notifikasi ini'), { statusCode: 403 });
  }

  await prisma.notification.updateMany({
    where: { customerId, isRead: false },
    data: { isRead: true },
  });
  return { message: 'Semua notifikasi berhasil ditandai sudah dibaca' };
}

async function createNotification(data) {
  return prisma.notification.create({ data });
}

module.exports = { getCustomerNotifications, markAsRead, markAllAsRead, createNotification };

