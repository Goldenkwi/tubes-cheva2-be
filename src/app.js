const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const env = require('./config/env');
const prisma = require('./config/database');

const swaggerDocument = require('../docs/swagger.json');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.isDev) {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Cheva Laundry API is running', timestamp: new Date().toISOString() });
});

app.get('/api/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'Cheva Laundry API is ready', timestamp: new Date().toISOString() });
  } catch (_err) {
    res.status(503).json({ success: false, message: 'Database is not ready' });
  }
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
