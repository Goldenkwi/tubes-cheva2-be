const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!jwtSecret || jwtSecret === 'your-secret-key-change-this-in-production') {
  throw new Error('JWT_SECRET must be configured and must not use the example value');
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be configured');
}

const env = {
  nodeEnv,
  port: parseInt(process.env.PORT, 10) || 8000,
  database: {
    url: databaseUrl,
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  },
  isDev: nodeEnv === 'development',
  isProd: nodeEnv === 'production',
};

module.exports = env;
