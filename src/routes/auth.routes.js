const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authenticate, adminOnly, validate(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/me/password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
