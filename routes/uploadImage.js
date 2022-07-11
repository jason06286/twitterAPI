const express = require('express');

const router = express.Router();

const { isAuth, checkUpload } = require('../middleware/index');

const uploadImageControllers = require('../controllers/uploadImage');
/**
 * POST /api/uploadImage{ data?: any }
 */
router.post('/', isAuth, checkUpload, uploadImageControllers.uploadImage);
router.post('/base64', isAuth, checkUpload, uploadImageControllers.uploadBase64Image);

module.exports = router;
