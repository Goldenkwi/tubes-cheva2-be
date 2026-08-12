const prisma = require('../config/database');

function validatePricing(service) {
  const priceField = service.type === 'SATUAN' ? 'priceUnit' : 'pricePerKg';
  if (!service[priceField]) {
    throw Object.assign(new Error(`${priceField} is required for ${service.type}`), { statusCode: 400 });
  }
}

async function listServices(activeOnly = true) {
  const where = activeOnly ? { isActive: true } : {};
  return prisma.service.findMany({
    where,
    orderBy: { type: 'asc' },
    include: {
      children: {
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { name: 'asc' },
      },
    },
  });
}

// Returns only top-level services (no parent) with their nested children,
// so the FE can render the Layanan Utama / Layanan Tambahan hierarchy.
async function listServiceTree(activeOnly = true) {
  const where = { parentId: null };
  if (activeOnly) where.isActive = true;
  return prisma.service.findMany({
    where,
    orderBy: { type: 'asc' },
    include: {
      children: {
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { name: 'asc' },
      },
    },
  });
}

async function getService(id) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  return service;
}

async function createService(data) {
  validatePricing(data);
  return prisma.service.create({ data });
}

async function updateService(id, data) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  validatePricing({ ...service, ...data });
  return prisma.service.update({ where: { id }, data });
}

async function deactivateService(id) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  return prisma.service.update({
    where: { id },
    data: { isActive: false },
  });
}

module.exports = { listServices, listServiceTree, getService, createService, updateService, deactivateService };
