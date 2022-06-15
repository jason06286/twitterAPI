const path = require("path");
const multer = require("multer");

const User = require("../models/users");

const handleErrorAsync = require("../service/handleErrorAsync");
const { appError } = require("../service/handleError");
const decoding = require("../service/decodingJWT");

const checkReqParamsId = async (req, res, next) => {
  const { id } = req.params;
  if (id.length === 24) {
    next();
  } else {
    appError(400, "請帶入正確ID", next);
  }
};

const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  if (!req.headers.authorization) {
    return appError(401, "未帶入token", next);
  }
  if (!req.headers.authorization.startsWith("Bearer")) {
    return appError(401, "格式錯誤", next);
  }
  token = req.headers.authorization.split(" ")[1];

  // 驗證token 正確性
  const decoded = await decoding(token);
  console.log("decoded :>> ", decoded);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return appError(401, "未授權", next);
  }
  next();
});

const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpg") {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
    }
    cb(null, true);
  },
}).any();

module.exports = {
  checkReqParamsId,
  isAuth,
  upload,
};
