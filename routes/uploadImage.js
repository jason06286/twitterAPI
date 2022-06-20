const express = require('express');

const router = express.Router();

const { isAuth, checkUpload } = require('../middleware/index');

const uploadImageControllers = require('../controllers/uploadImage');
/**
 * POST /api/uploadImage{ data?: any }
 */
router.post('/', isAuth, checkUpload, uploadImageControllers.uploadImage);

module.exports = router;
