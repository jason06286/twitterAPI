const jwt = require('jsonwebtoken');
const handleSuccess = require('./handleSuccess');

const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  const { name, photo, id } = user;
  const data = {
    message: '登入成功',
    name,
    photo,
    id,
    token,
  };
  handleSuccess(res, statusCode, data);
};

const generateUrlJWT = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  res.redirect(
    `${process.env.CLIENT_BASE_URL}?token=${token}&name=${user.name}&photo=${user.photo}&id=${user._id}`,
  );
};

module.exports = { generateSendJWT, generateUrlJWT };
