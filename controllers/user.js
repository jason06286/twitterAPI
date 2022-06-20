/* eslint-disable consistent-return */
const validator = require('validator');
const bcrypt = require('bcryptjs');

const User = require('../models/UsersModel');
const Profile = require('../models/ProfileModel');
const Follow = require('../models/FollowModel');

const { appError } = require('../service/handleError');
const { generateSendJWT } = require('../service/generateJWT');
const handleSuccess = require('../service/handleSuccess');
const handleErrorAsync = require('../service/handleErrorAsync');
const decoding = require('../service/decodingJWT');

const userControllers = {
  getUsers: handleErrorAsync(async (req, res) => {
    const users = await User.find({}).sort({ name: 1 });
    handleSuccess(res, 200, { users });
  }),
  register: handleErrorAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const errMessage = {};
    if (!name || !email || !password) {
      return appError(422, '欄位未填寫正確', next);
    }
    if (!validator.isLength(password, { min: 8 })) {
      errMessage.password = '密碼 字數太少，至少需要 8 個字';
    }
    if (!validator.isEmail(email)) {
      errMessage.email = '電子信箱 格式有誤';
    }
    if (Object.keys(errMessage).length) {
      return appError(422, errMessage, next);
    }
    // 比對 資料庫email
    const isRegister = await User.findOne({ email });
    // 成功註冊回傳資料，隱藏password
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
      const user = newUser._id;
      await Profile.create({ user });
      await Follow.create({ userId: user });

      const resData = {
        message: '註冊成功',
        email: newUser.email,
        name: newUser.name,
        photo: newUser.photo,
        id: newUser._id,
      };
      handleSuccess(res, 200, resData);
    } else {
      return appError(422, '此信箱已註冊過', next);
    }
  }),
  logIn: handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return appError(401, '欄位未填寫正確', next);
    }
    if (!validator.isEmail(email)) {
      return appError(401, '電子信箱 格式有誤', next);
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return appError(401, '此電子信箱尚未註冊', next);
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return appError(401, '密碼有誤，請重新輸入', next);
    }
    generateSendJWT(user, 200, res);
  }),
  check: handleErrorAsync(async (req, res, next) => {
    const currentUser = await decoding(req);
    const profile = await Profile.findOne({ user: currentUser.id }).populate({
      path: 'user',
    });
    if (!profile) {
      return appError(400, '查無此用戶', next);
    }
    handleSuccess(res, 200, profile);
  }),
  getProfile: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const profile = await Profile.findOne({ user: id }).populate({
      path: 'user',
    });
    if (!profile) {
      return appError(400, '查無此用戶', next);
    }
    handleSuccess(res, 200, profile);
  }),
  updateProfile: handleErrorAsync(async (req, res, next) => {
    const currentUser = await decoding(req);
    const _id = currentUser.id;
    const {
      name, photo, coverImage, description,
    } = req.body;
    if (!name && !photo && !coverImage && !description) {
      return appError(400, '請輸入要更新的資訊', next);
    }
    await User.findByIdAndUpdate(
      _id,
      { name, photo },
      { returnDocument: 'after' },
    );
    const profile = await Profile.findOneAndUpdate(
      { user: _id },
      { coverImage, description },
      { returnDocument: 'after' },
    ).populate({
      path: 'user',
    });
    handleSuccess(res, 200, profile);
  }),
  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { password } = req.body;
    if (!password) {
      return appError(422, '欄位未填寫正確', next);
    }
    if (!validator.isLength(password, { min: 8 })) {
      return appError(422, '密碼 字數太少，至少需要 8 個字', next);
    }
    const currentUser = await decoding(req);
    await User.findByIdAndUpdate(
      currentUser.id,
      { password: await bcrypt.hash(password, 12) },
      { new: true },
    );
    handleSuccess(res, 200, null, '密碼重設成功!');
  }),
};

module.exports = userControllers;
