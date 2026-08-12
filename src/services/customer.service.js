const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { signToken } = require('../utils/jwt');

async function registerCustomer(data) {
  const phone = data.phone ? data.phone.trim() : '';
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    if (existing.password) {
      throw Object.assign(new Error('Nomor telepon sudah terdaftar dan aktif. Silakan login.'), { statusCode: 400 });
    } else {
      throw Object.assign(
        new Error('Nomor telepon sudah didaftarkan oleh Kasir. Silakan gunakan fitur Claim Account / Set Password Pertama Kali.'),
        { statusCode: 400 }
      );
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const normalizedEmail = data.email ? data.email.trim().toLowerCase() : null;

  const customer = await prisma.customer.create({
    data: {
      name: data.name.trim(),
      phone,
      password: hashedPassword,
      email: normalizedEmail,
      address: data.address ? data.address.trim() : null,
    },
    select: { id: true, name: true, phone: true, email: true, address: true, createdAt: true },
  });

  const token = signToken({ customerId: customer.id, role: 'CUSTOMER' });
  return { token, customer };
}

async function loginCustomer(phone, password) {
  const normalizedPhone = phone ? phone.trim() : '';
  const customer = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  if (!customer) {
    throw Object.assign(new Error('Nomor telepon atau password salah'), { statusCode: 401 });
  }

  if (!customer.password) {
    throw Object.assign(
      new Error('Akun Anda belum memiliki password. Silakan gunakan menu Set Password Pertama Kali.'),
      { statusCode: 400 }
    );
  }

  const valid = await bcrypt.compare(password, customer.password);
  if (!valid) {
    throw Object.assign(new Error('Nomor telepon atau password salah'), { statusCode: 401 });
  }

  const token = signToken({ customerId: customer.id, role: 'CUSTOMER' });
  return {
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      loyaltyPoints: customer.loyaltyPoints,
    },
  };
}

async function claimAccount(phone, password) {
  const normalizedPhone = phone ? phone.trim() : '';
  const customer = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  if (!customer) {
    throw Object.assign(new Error('Data pelanggan dengan nomor telepon ini tidak ditemukan'), { statusCode: 404 });
  }

  if (customer.password) {
    throw Object.assign(
      new Error('Akun ini sudah memiliki password. Silakan gunakan menu login.'),
      { statusCode: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: { password: hashedPassword },
    select: { id: true, name: true, phone: true, email: true, address: true },
  });

  const token = signToken({ customerId: updatedCustomer.id, role: 'CUSTOMER' });
  return {
    message: 'Password berhasil dibuat. Akun Anda telah aktif.',
    token,
    customer: updatedCustomer,
  };
}

async function getCustomerProfile(customerId) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      totalOrders: true,
      totalWeight: true,
      loyaltyPoints: true,
      createdAt: true,
    },
  });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  return customer;
}

async function updateCustomerProfile(customerId, data) {
  const updateData = {};
  if (data.name) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email ? data.email.trim().toLowerCase() : null;
  if (data.address !== undefined) updateData.address = data.address ? data.address.trim() : null;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  return prisma.customer.update({
    where: { id: customerId },
    data: updateData,
    select: { id: true, name: true, phone: true, email: true, address: true, loyaltyPoints: true },
  });
}

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
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      totalOrders: true,
      totalWeight: true,
      loyaltyPoints: true,
      createdAt: true,
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
  delete customer.password;
  return customer;
}

async function createCustomer(data) {
  const phone = data.phone ? data.phone.trim() : '';
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) throw Object.assign(new Error('Nomor telepon sudah terdaftar'), { statusCode: 400 });

  return prisma.customer.create({
    data: {
      name: data.name.trim(),
      phone,
      email: data.email ? data.email.trim().toLowerCase() : null,
      address: data.address ? data.address.trim() : null,
    },
  });
}

async function updateCustomer(id, data) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });

  if (data.phone) {
    const phone = data.phone.trim();
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing && existing.id !== id) {
      throw Object.assign(new Error('Nomor telepon sudah digunakan'), { statusCode: 400 });
    }
  }

  return prisma.customer.update({ where: { id }, data });
}

module.exports = {
  registerCustomer,
  loginCustomer,
  claimAccount,
  getCustomerProfile,
  updateCustomerProfile,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
};

