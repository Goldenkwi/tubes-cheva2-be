const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');

const router = Router();

router.get('/stats', authenticate, staffAndAbove, dashboardController.getStats);
router.get('/recent-orders', authenticate, staffAndAbove, dashboardController.getRecentOrders);
router.get('/revenue-chart', authenticate, staffAndAbove, dashboardController.getRevenueChart);

module.exports = router;
