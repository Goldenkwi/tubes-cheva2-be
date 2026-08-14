const prisma = require('../config/database');
const { ORDER_STATUS_LABEL } = require('../utils/constants');

// Backend OrderStatus enum -> FE StatusBadge tone keys (see
// tubes-cheva2-fe/src/modules/orders/utils/orderStatus.js BE_TO_FE).
const BE_TO_FE_TONE = {
  PENDING: 'menunggu',
  WASHING: 'dicuci',
  DRYING: 'dikeringkan',
  IRONING: 'disetrika',
  READY: 'siap_diambil',
  DELIVERED: 'diantar',
  COMPLETED: 'selesai',
  CANCELLED: 'dibatalkan',
};

function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function formatRupiah(amount) {
  return `Rp ${(amount ?? 0).toLocaleString('id-ID')}`;
}

// Build the shared "Lihat Detail" payload the FE's OrderDetailModal expects:
// { code, customerName, changedAt, fromStatus, toStatus, orderInfo,
//   statusHistory, paymentInfo } with fromStatus/toStatus as FE tone keys and
// statusHistory as [{ date, time, status }] newest-first.
function buildOrderDetail(order) {
  const histories = order.statusHistories || [];
  const latest = histories[histories.length - 1];
  const prev = histories[histories.length - 2];
  const latestChangeAt = latest ? latest.createdAt : order.createdAt;

  const unit = order.service && order.service.type === 'SATUAN' ? 'Pcs' : 'Kg';
  const qty = order.service && order.service.type === 'SATUAN' ? order.itemCount : order.weight;

  return {
    code: order.orderNumber,
    customerName: order.customer ? order.customer.name : null,
    changedAt: latestChangeAt
      ? `${formatDate(latestChangeAt)}, ${formatTime(latestChangeAt)}`
      : null,
    fromStatus: prev ? BE_TO_FE_TONE[prev.status] ?? 'menunggu' : undefined,
    toStatus: prev ? BE_TO_FE_TONE[latest.status] ?? 'menunggu' : undefined,
    orderInfo: [
      { label: 'No. Pesanan', value: order.orderNumber },
      { label: 'Pelanggan', value: order.customer ? order.customer.name : null },
      { label: 'No. Telp', value: order.customer ? order.customer.phone : null },
      { label: 'Layanan', value: order.service ? order.service.name : null },
      { label: 'Berat', value: qty ? `${qty} ${unit}` : '-' },
      { label: 'Total', value: formatRupiah(order.totalPrice) },
    ],
    statusHistory: [...histories].reverse().map((history) => ({
      date: formatDate(history.createdAt),
      time: formatTime(history.createdAt),
      status: ORDER_STATUS_LABEL[history.status] ?? history.status,
    })),
    paymentInfo: [
      {
        label: 'Metode Pembayaran',
        value: order.transaction ? order.transaction.paymentMethod : '-',
      },
      { label: 'Dibuat Pada', value: `${formatDate(order.createdAt)}, ${formatTime(order.createdAt)}` },
      { label: 'Terakhir Diubah', value: latestChangeAt ? `${formatDate(latestChangeAt)}, ${formatTime(latestChangeAt)}` : null },
    ],
  };
}

async function listHistory({ search, startDate, endDate, statuses = [], services = [], page = 1, limit = 20 }) {
  const where = {};
  const orderWhere = {};

  if (search) {
    orderWhere.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (services.length > 0) {
    orderWhere.service = { name: { in: services } };
  }

  if (statuses.length > 0) {
    where.status = { in: statuses };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(`${startDate}T00:00:00`);
    if (endDate) where.createdAt.lte = new Date(`${endDate}T23:59:59`);
  }

  if (Object.keys(orderWhere).length > 0) {
    where.order = orderWhere;
  }

  const total = await prisma.orderStatusHistory.count({ where });
  const histories = await prisma.orderStatusHistory.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          service: { select: { id: true, name: true, type: true } },
          transaction: true,
          statusHistories: {
            orderBy: { createdAt: 'asc' },
            select: { status: true, createdAt: true },
          },
        },
      },
    },
  });

  const data = histories.map((history) => {
    const orderHistories = history.order.statusHistories || [];
    const index = orderHistories.findIndex((h) => h.createdAt.getTime() === history.createdAt.getTime());
    const prev = index > 0 ? orderHistories[index - 1] : null;

    return {
      id: history.id,
      code: history.order.orderNumber,
      name: history.order.customer ? history.order.customer.name : null,
      date: formatDate(history.createdAt),
      time: formatTime(history.createdAt),
      changeFrom: prev ? ORDER_STATUS_LABEL[prev.status] ?? prev.status : 'Pesanan dibuat',
      changeTo: ORDER_STATUS_LABEL[history.status] ?? history.status,
      detail: buildOrderDetail(history.order),
    };
  });

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { listHistory };
