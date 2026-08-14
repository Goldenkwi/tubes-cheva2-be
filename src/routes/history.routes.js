const { Router } = require('express');
const historyController = require('../controllers/history.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, staffAndAbove, historyController.listHistory);

module.exports = router;
