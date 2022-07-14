# twitterShare
## [API 文件](https://fast-tundra-64548.herokuapp.com/api-doc/#/) | [前端 repo](https://github.com/jason06286/twitterDemoFrontend) | [Demo 頁面](https://jason06286.github.io/twitterDemoFrontend/#/)

## 使用技術

串接 `MongoDB` 做資料庫管理

使用 `MVC` 架構，拆分邏輯

使用 `RESTful API` 規範， 規劃 `API` 架構

使用 `JWT` 做無狀態驗證管理

使用 `Passport` 串接第三方登入

## Coding Style
* ESLint-Airbnb
## Error Handling

將錯誤管理包成  `appError` 使用 `next(error)`，讓 `resErrorProd` 會 `error catch` 進行回應
```
const appError = (httpStatus, errMessage, next) => {
  let error;
  if (typeof errMessage === 'string') {
    error = new Error(errMessage);
  } else {
    error = new Error();
    error.err = errMessage;
  }
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

```
```
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    if (err.message) {
      res.status(err.statusCode).send({
        status: false,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).send({
        status: false,
        message: err.err,
      });
    }
  } else {
    console.error('出現重大錯誤');
    res.status(500).send({
      status: 'error',
      message: '系統錯誤，請洽系統管理員!!',
    });
  }
};
```
```
{
  "code": 404,
  "message": "Not found"
}

```
## Authentication

使用  `isAuth middleware` 做權限驗證，`isAuth` 使用 `JWT` 做驗證管理 
```
const express = require('express');

const router = express.Router();

const userControllers = require('../controllers/user');

const { isAuth } = require('../middleware/index');

router.get('/check', isAuth, userControllers.check);
```



## 開發

```
# install deps
npm install

# run product
npm run start

# run dev server
npm run dev

```
