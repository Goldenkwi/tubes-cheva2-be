const { Router } = require('express');
const laundryProfileController = require('../controllers/laundryProfile.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { laundryProfileSchema } = require('../validators/laundryProfile.validator');

const router = Router();

router.get('/', authenticate, staffAndAbove, laundryProfileController.getProfile);
router.put('/', authenticate, staffAndAbove, validate(laundryProfileSchema), laundryProfileController.updateProfile);

module.exports = router;
