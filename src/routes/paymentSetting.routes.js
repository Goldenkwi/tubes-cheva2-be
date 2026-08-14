const { Router } = require('express');
const paymentSettingController = require('../controllers/paymentSetting.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paymentSettingSchema } = require('../validators/paymentSetting.validator');

const router = Router();

router.get('/', authenticate, staffAndAbove, paymentSettingController.getSettings);
router.put('/', authenticate, staffAndAbove, validate(paymentSettingSchema), paymentSettingController.updateSettings);

module.exports = router;
