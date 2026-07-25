const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');
const { logger } = require('./utils/logger');

async function start() {
  await prisma.$connect();
  logger.info('Database connected');

  const server = app.listen(env.port, () => {
    logger.info(`Cheva Laundry API running on port ${env.port}`);
    logger.info(`Environment: ${env.nodeEnv}`);
    logger.info(`Health check: http://localhost:${env.port}/api/health`);
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received, shutting down`);

    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch(async (err) => {
  logger.error(`Application startup failed: ${err.message}`);
  await prisma.$disconnect();
  process.exit(1);
});
