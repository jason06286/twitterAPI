const validator = require("validator");
const bcrypt = require("bcryptjs");

const User = require("../models/UsersModel");

const { appError } = require("../service/handleError");
const generateSendJWT = require("../service/generateSendJWT");
const handleSuccess = require("../service/handleSuccess");
const handleErrorAsync = require("../service/handleErrorAsync");
const decoding = require("../service/decodingJWT");

const userControllers = {
  getUsers: handleErrorAsync(async (req, res, next) => {
    const users = await User.find({}).sort({ name: 1 });
    handleSuccess(res, 200, { users });
  }),
  register: handleErrorAsync(async (req, res, next) => {
    /**
     * #swagger.tags = ['Users']
        * #swagger.summary = '使用者註冊'
        #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { "user": {
                            "email": "string",
                            "name": "string",
                            "password": "string",
                            "photo":"string"
                            } }
            }
     * #swagger.responses[200] = {
          description: '註冊成功',
          
        }
     * #swagger.responses[422] = {
          description: '註冊失敗',
          
        }
    }
     */
    const { name, email, password } = req.body;
    const errMessage = {};
    if (!name || !email || !password) {
      return appError(422, "欄位未填寫正確", next);
    }
    if (!validator.isLength(password, { min: 8 })) {
      errMessage.password = "密碼 字數太少，至少需要 8 個字";
    }
    if (!validator.isEmail(email)) {
      errMessage.email = "電子信箱 格式有誤";
    }
    if (Object.keys(errMessage).length) {
      return appError(422, errMessage, next);
    }
    // 比對 資料庫email
    const isRegister = await User.findOne({ email });
    //成功註冊回傳資料，隱藏password
    if (!isRegister) {
      let newUser;
      if (!req.body.photo) {
        newUser = await User.create({
          name,
          email,
          password: await bcrypt.hash(password, 12),
        });
      } else {
        newUser = await User.create({
          name,
          email,
          photo: req.body.user.photo,
          password: await bcrypt.hash(password, 12),
        });
      }

      const resData = {
        message: "註冊成功",
        email: newUser.email,
        name: newUser.name,
        photo: newUser.photo,
        _id: newUser._id,
      };
      handleSuccess(res, 200, resData);
    } else {
      return appError(422, "此信箱已註冊過", next);
    }
  }),
  logIn: handleErrorAsync(async (req, res, next) => {
    /**
     * #swagger.tags = ['Users']
        * #swagger.summary = '使用者登入'
        #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { "user": {
                            "email": "string",
                            "password": "string"
                            } }
            }
     * #swagger.responses[200] = {
          description: '登入成功',
        }
     * #swagger.responses[401] = {
          description: '登入失敗',
          
        }
    }
     */

    const { email, password } = req.body;
    if (!email || !password) {
      return appError(401, "欄位未填寫正確", next);
    }
    if (!validator.isEmail(email)) {
      return appError(401, "電子信箱 格式有誤", next);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return appError(401, "此電子信箱尚未註冊", next);
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return appError(401, "密碼有誤，請重新輸入", next);
    }
    generateSendJWT(user, 200, res);
  }),
  check: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Check']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '登入權限測試'
      * #swagger.responses[200] = {
          description: 'OK',
        }
      * #swagger.responses[401] = {
          description: '未授權',
        }
      }
    */
    handleSuccess(res, 200, null, "已授權");
  }),
};

module.exports = userControllers;
