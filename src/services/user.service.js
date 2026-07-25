const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

async function listUsers() {
  return prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateUser(id, data) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });
}

async function deactivateUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, name: true, isActive: true },
  });
}

module.exports = { listUsers, updateUser, deactivateUser };
