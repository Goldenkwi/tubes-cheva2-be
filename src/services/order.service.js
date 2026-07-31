const prisma = require('../config/database');
const { randomInt } = require('crypto');
const { ORDER_STATUS, ORDER_STATUS_LABEL, ORDER_TRANSITIONS, SERVICE_TYPE } = require('../utils/constants');

function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(randomInt(1000, 10000));
  return `LC-${date}-${rand}`;
}

function calculateTotalPrice(service, { weight, itemCount }) {
  if (!service.isActive) {
    throw Object.assign(new Error('Service is inactive'), { statusCode: 400 });
  }

  if (service.type === SERVICE_TYPE.SATUAN) {
    if (!itemCount || !service.priceUnit) {
      throw Object.assign(new Error('Item count and unit price are required for this service'), { statusCode: 400 });
    }
    return service.priceUnit * itemCount;
  }

  if (!weight || !service.pricePerKg) {
    throw Object.assign(new Error('Weight and price per kg are required for this service'), { statusCode: 400 });
  }
  return Math.round(service.pricePerKg * weight);
}

async function listOrders({ status, customerId, page = 1, limit = 20, startDate, endDate }) {
  const where = {};
  if (status) where.status = status;
  if (customerId) where.customerId = parseInt(customerId);
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      service: { select: { id: true, name: true, type: true } },
      courier: { select: { id: true, name: true } },
      statusHistories: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return {
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function listMyOrders(customerId, { page = 1, limit = 20 }) {
  const where = { customerId };
  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { id: true, name: true, type: true } },
      courier: { select: { id: true, name: true } },
      statusHistories: { orderBy: { createdAt: 'desc' }, take: 1 },
      transaction: true,
    },
  });

  return {
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getOrder(id, requester = null) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      service: true,
      courier: { select: { id: true, name: true } },
      transaction: true,
      statusHistories: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (requester && requester.customer && order.customerId !== requester.customer.id) {
    throw Object.assign(new Error('Anda tidak memiliki akses ke pesanan ini'), { statusCode: 403 });
  }

  return order;
}

async function createOrder(data, userId = null, customerIdOverride = null) {
  const targetCustomerId = customerIdOverride || data.customerId;
  if (!targetCustomerId) {
    throw Object.assign(new Error('Customer ID wajib diisi'), { statusCode: 400 });
  }

  const orderNumber = generateOrderNumber();
  const order = await prisma.$transaction(async (tx) => {
    const service = await tx.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
    const totalPrice = calculateTotalPrice(service, data);

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId: targetCustomerId,
        serviceId: data.serviceId,
        weight: data.weight,
        itemCount: data.itemCount,
        totalPrice,
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        estimatedDone: data.estimatedDone ? new Date(data.estimatedDone) : undefined,
        notes: data.notes,
        courierId: data.courierId,
        status: ORDER_STATUS.PENDING,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        status: ORDER_STATUS.PENDING,
        changedBy: userId || null,
        notes: 'Pesanan dibuat',
      },
    });

    await tx.customer.update({
      where: { id: targetCustomerId },
      data: {
        totalOrders: { increment: 1 },
        totalWeight: { increment: data.weight || 0 },
      },
    });

    return newOrder;
  });

  return getOrder(order.id);
}

async function updateOrder(id, data) {
  const order = await prisma.order.findUnique({ where: { id }, include: { service: true } });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  const updateData = {
    ...data,
    estimatedDone: data.estimatedDone ? new Date(data.estimatedDone) : data.estimatedDone,
  };

  const quantityChanged = data.weight !== undefined || data.itemCount !== undefined;
  if (!quantityChanged) {
    return prisma.order.update({ where: { id }, data: updateData });
  }

  const nextWeight = data.weight ?? order.weight;
  const nextItemCount = data.itemCount ?? order.itemCount;
  updateData.totalPrice = calculateTotalPrice(order.service, {
    weight: nextWeight,
    itemCount: nextItemCount,
  });
  const weightDelta = (nextWeight || 0) - (order.weight || 0);

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({ where: { id }, data: updateData }),
    prisma.customer.update({
      where: { id: order.customerId },
      data: { totalWeight: { increment: weightDelta } },
    }),
  ]);

  return updatedOrder;
}

async function updateStatus(id, status, userId, notes) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (!ORDER_TRANSITIONS[order.status].includes(status)) {
    throw Object.assign(new Error(`Cannot move status from ${order.status} to ${status}`), {
      statusCode: 400,
    });
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id, status: order.status },
      data: {
        status,
        completedAt: status === ORDER_STATUS.COMPLETED ? new Date() : undefined,
      },
    });
    if (updated.count !== 1) {
      throw Object.assign(new Error('Order status changed, please retry'), { statusCode: 409 });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        changedBy: userId,
        notes: notes || ORDER_STATUS_LABEL[status],
      },
    });
    await tx.notification.create({
      data: {
        customerId: order.customerId,
        orderId: id,
        type: 'STATUS_UPDATE',
        title: `Pesanan ${order.orderNumber}`,
        message: `Status pesanan Anda: ${ORDER_STATUS_LABEL[status]}`,
      },
    });

    return tx.order.findUnique({ where: { id } });
  });

  return updatedOrder;
}

async function trackOrder(trackingToken) {
  const order = await prisma.order.findUnique({
    where: { trackingToken },
    select: {
      orderNumber: true,
      status: true,
      estimatedDone: true,
      completedAt: true,
      createdAt: true,
      service: { select: { name: true, type: true } },
      statusHistories: {
        orderBy: { createdAt: 'asc' },
        select: { status: true, createdAt: true },
      },
    },
  });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return order;
}

module.exports = { listOrders, listMyOrders, getOrder, createOrder, updateOrder, updateStatus, trackOrder };

