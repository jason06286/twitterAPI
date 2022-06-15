const resErrorDev = (err, res) => {
  res.status(err.statusCode).send({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    if (err.message) {
      res.status(err.statusCode).send({
        message: err.message,
      });
    } else {
      res.status(err.statusCode).send({
        message: err.err,
      });
    }
  } else {
    console.error("出現重大錯誤");
    res.status(500).send({
      status: "error",
      message: "系統錯誤，請洽系統管理員!!",
    });
  }
};

const appError = (httpStatus, errMessage, next) => {
  let error;
  if (typeof errMessage === "string") {
    error = new Error(errMessage);
  } else {
    error = new Error();
    error.err = errMessage;
  }
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

module.exports = {
  resErrorDev,
  resErrorProd,
  appError,
};
