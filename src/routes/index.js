const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const customerRoutes = require('./customer.routes');
const orderRoutes = require('./order.routes');
const serviceRoutes = require('./service.routes');
const transactionRoutes = require('./transaction.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');

const router = Router();

// Auth routes are flattened at the API root (/api/login, /api/register, ...)
// to match the frontend's expected endpoints.
router.use('/', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/services', serviceRoutes);
// Frontend refers to the service catalog as "products"; alias the same
// resource under /products so existing FE calls resolve without renaming.
router.use('/products', serviceRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
