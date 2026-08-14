const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
    user: { id: user.id, name: user.name, email: user.email, role: user.role, photoUrl: user.photoUrl },
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
    select: { id: true, name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
}

async function updateProfile(userId, data) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
  if (data.email !== undefined) {
    updateData.email = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: updateData.email } });
    if (existing && existing.id !== userId) {
      throw Object.assign(new Error('Email sudah terdaftar'), { statusCode: 400 });
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true },
  });
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw Object.assign(new Error('Password lama salah'), { statusCode: 400 });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { id: user.id, name: user.name, email: user.email };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    // Don't reveal whether the email exists — still respond success.
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000) },
  });

  // No email provider configured: return the token so it can be delivered by
  // the caller (dev/demo). In production, swap this for an email send.
  return { ok: true, resetToken: token };
}

async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
  });
  if (!user) {
    throw Object.assign(new Error('Token reset tidak valid atau sudah kadaluarsa'), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpires: null },
  });

  return { id: user.id, email: user.email };
}

module.exports = { login, register, getProfile, updateProfile, changePassword, forgotPassword, resetPassword };
