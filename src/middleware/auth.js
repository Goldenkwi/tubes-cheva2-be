const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');
const response = require('../utils/response');
const { ROLE } = require('../utils/constants');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return response.unauthorized(res, 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return response.unauthorized(res, 'User not found or inactive');
  }

  req.user = user;
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return response.unauthorized(res, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      return response.forbidden(res, 'Insufficient permissions');
    }
    next();
  };
}

const adminOnly = authorize(ROLE.ADMIN);
const staffAndAbove = authorize(ROLE.ADMIN, ROLE.STAFF);

module.exports = { authenticate, authorize, adminOnly, staffAndAbove };
