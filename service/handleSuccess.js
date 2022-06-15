const express = require("express");

const handleSuccess = (res, httpStatus, data, message) => {
  data
    ? res.status(httpStatus).send({ status: "success", data })
    : res.status(httpStatus).send({ status: "success", message });
};

module.exports = handleSuccess;
