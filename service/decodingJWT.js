const jwt = require("jsonwebtoken");

const decoding = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        err.isOperational = true;
        err.message = "JWT 過期或錯誤";
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};

module.exports = decoding;
