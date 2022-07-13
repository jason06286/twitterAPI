/* eslint-disable consistent-return */
const path = require('path');
const multer = require('multer');

const User = require('../models/UsersModel');

const handleErrorAsync = require('../service/handleErrorAsync');
const { appError } = require('../service/handleError');
const decoding = require('../service/decodingJWT');

const checkReqParamsId = async (req, res, next) => {
  const { id } = req.params;
  if (id.length === 24) {
    next();
  } else {
    appError(400, '請帶入正確ID', next);
  }
};

const isAuth = handleErrorAsync(async (req, res, next) => {
  if (!req.headers.authorization) {
    return appError(401, '未帶入token', next);
  }
  if (!req.headers.authorization.startsWith('Bearer')) {
    return appError(401, '格式錯誤', next);
  }

  // 驗證token 正確性
  const decoded = await decoding(req);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return appError(401, '未授權', next);
  }
  next();
});

const checkUpload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (req.file?.size > 2000000) {
      cb(new Error('圖片檔案過大，僅限 2mb 以下檔案'));
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpg') {
      cb(new Error('檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。'));
    }
    cb(null, true);
  },
}).any();

module.exports = {
  checkReqParamsId,
  isAuth,
  checkUpload,
};
