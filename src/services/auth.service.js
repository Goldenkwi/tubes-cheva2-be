const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { signToken } = require('../utils/jwt');

async function login(email, password) {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw Object.assign(new Error('Email atau password salah'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Email atau password salah'), { statusCode: 401 });

  if (!user.isActive) throw Object.assign(new Error('Akun telah dinonaktifkan'), { statusCode: 403 });

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

async function register(data) {
  const normalizedEmail = data.email ? data.email.trim().toLowerCase() : '';
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw Object.assign(new Error('Email sudah terdaftar'), { statusCode: 400 });

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: data.phone,
      role: data.role || 'STAFF',
    },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });
  return user;
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
}

module.exports = { login, register, getProfile };
