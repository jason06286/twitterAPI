const jwt = require("jsonwebtoken");

const decoding = (req) => {
  const token = req.headers.authorization.split(" ")[1];
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
