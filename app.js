/* eslint-disable consistent-return */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const createThirdPartyAuth = require('./service/thirdPartyAuth');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const followRouter = require('./routes/follow');
const uploadImageRouter = require('./routes/uploadImage');

const swaggerFile = require('./swagger-output.json');

const {
  appError,
  resErrorDev,
  resErrorProd,
} = require('./service/handleError');

require('./connections/index');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const thirdPartyAuth = createThirdPartyAuth(app, {
  googleAppId: process.env.GOOGLE_CLIENT_ID,
  googleAppSecret: process.env.GOOGLE_CLIENT_SECRET,
  baseUrl: process.env.CLIENT_BASE_URL,
});

thirdPartyAuth.init();

thirdPartyAuth.registerRoutes();

app.use('/', indexRouter);
app.use('/api/user', userRouter);
app.use('/api', postRouter);
app.use('/api/follow', followRouter);
app.use('/api/uploadImage', uploadImageRouter);

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

require('./unpredictable');
// catch 404 and forward to error handler
app.use((req, res, next) => {
  appError(404, '無此路由，請回首頁!!', next);
});

// error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }

  if (err.name === 'ValidationError') {
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
});

module.exports = app;
