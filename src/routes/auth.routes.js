const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
// TODO: registration is public for local development only. Restrict back to
// authenticate + adminOnly once an admin-managed staff creation flow exists.
router.post('/register', validate(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
