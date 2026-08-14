const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const customerRoutes = require('./customer.routes');
const orderRoutes = require('./order.routes');
const serviceRoutes = require('./service.routes');
const transactionRoutes = require('./transaction.routes');
const expenseRoutes = require('./expense.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');
const cannedQuestionRoutes = require('./cannedQuestion.routes');
const historyRoutes = require('./history.routes');
const chatRoutes = require('./chat.routes');
const laundryProfileRoutes = require('./laundryProfile.routes');
const paymentSettingRoutes = require('./paymentSetting.routes');
const uploadRoutes = require('./upload.routes');

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
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/canned-questions', cannedQuestionRoutes);
router.use('/quick-replies', cannedQuestionRoutes);
router.use('/history', historyRoutes);
router.use('/chat', chatRoutes);
router.use('/laundry-profile', laundryProfileRoutes);
router.use('/payment-settings', paymentSettingRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
