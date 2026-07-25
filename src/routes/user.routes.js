const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, adminOnly, userController.listUsers);
router.put('/:id', authenticate, adminOnly, userController.updateUser);
router.delete('/:id', authenticate, adminOnly, userController.deactivateUser);

module.exports = router;
