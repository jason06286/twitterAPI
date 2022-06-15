const express = require("express");
const router = express.Router();
const { isAuth, checkUpload } = require("../middleware/index");
const uploadImageControllers = require("../controllers/uploadImage");

router.post("/", isAuth, checkUpload, uploadImageControllers.uploadImage);

module.exports = router;
