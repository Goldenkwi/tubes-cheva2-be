const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  log: env.isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
