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
  if (!decoded || !decoded.userId || typeof decoded.userId !== 'number') {
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

async function authenticateCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.customerId || typeof decoded.customerId !== 'number') {
    return response.unauthorized(res, 'Invalid or expired customer token');
  }

  const customer = await prisma.customer.findUnique({
    where: { id: decoded.customerId },
    select: { id: true, name: true, phone: true, email: true, address: true, totalOrders: true, loyaltyPoints: true },
  });

  if (!customer) {
    return response.unauthorized(res, 'Customer not found');
  }

  req.customer = customer;
  next();
}

async function authenticateCustomerOrUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return response.unauthorized(res, 'Invalid or expired token');
  }

  if (decoded.customerId && typeof decoded.customerId === 'number') {
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: { id: true, name: true, phone: true, email: true, address: true, totalOrders: true, loyaltyPoints: true },
    });
    if (!customer) {
      return response.unauthorized(res, 'Customer not found');
    }
    req.customer = customer;
    return next();
  }

  if (decoded.userId && typeof decoded.userId === 'number') {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return response.unauthorized(res, 'User not found or inactive');
    }
    req.user = user;
    return next();
  }

  return response.unauthorized(res, 'Invalid token payload');
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

module.exports = {
  authenticate,
  authenticateCustomer,
  authenticateCustomerOrUser,
  authorize,
  adminOnly,
  staffAndAbove,
};

