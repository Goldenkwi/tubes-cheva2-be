const { Router } = require('express');
const serviceController = require('../controllers/service.controller');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createServiceSchema, updateServiceSchema } = require('../validators/service.validator');

const router = Router();

router.get('/', serviceController.listServices);
router.get('/tree', serviceController.listServiceTree);
router.get('/:id', serviceController.getService);
router.post('/', authenticate, adminOnly, validate(createServiceSchema), serviceController.createService);
router.put('/:id', authenticate, adminOnly, validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, adminOnly, serviceController.deactivateService);

module.exports = router;
