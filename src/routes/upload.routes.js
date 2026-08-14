const { Router } = require('express');
const uploadController = require('../controllers/upload.controller');
const { authenticate, staffAndAbove } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = Router();

router.post('/', authenticate, staffAndAbove, upload.single('file'), uploadController.uploadFile);

module.exports = router;
