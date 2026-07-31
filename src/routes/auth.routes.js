const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authenticate, adminOnly, validate(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
