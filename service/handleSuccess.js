/* eslint-disable consistent-return */
const handleSuccess = (res, httpStatus, data, message) => {
  if (data) {
    return res.status(httpStatus).send({ status: 'success', data });
  }
  res.status(httpStatus).send({ status: 'success', message });
};

module.exports = handleSuccess;
