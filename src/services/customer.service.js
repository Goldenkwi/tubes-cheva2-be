const prisma = require('../config/database');

async function listCustomers({ search, page = 1, limit = 20 }) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const total = await prisma.customer.count({ where });
  const customers = await prisma.customer.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getCustomer(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { service: { select: { name: true } } },
      },
      _count: { select: { orders: true } },
    },
  });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  return customer;
}

async function createCustomer(data) {
  const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
  if (existing) throw Object.assign(new Error('Nomor telepon sudah terdaftar'), { statusCode: 400 });

  return prisma.customer.create({ data });
}

async function updateCustomer(id, data) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });

  if (data.phone) {
    const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
    if (existing && existing.id !== id) {
      throw Object.assign(new Error('Nomor telepon sudah digunakan'), { statusCode: 400 });
    }
  }

  return prisma.customer.update({ where: { id }, data });
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer };
