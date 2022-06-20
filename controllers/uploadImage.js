/* eslint-disable consistent-return */
const { ImgurClient } = require('imgur');

const { appError } = require('../service/handleError');
const handleSuccess = require('../service/handleSuccess');
const handleErrorAsync = require('../service/handleErrorAsync');

const uploadImageControllers = {
  uploadImage: handleErrorAsync(async (req, res, next) => {
    const { files } = req;
    if (!files.length) {
      return appError(400, '尚未上傳檔案', next);
    }

    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENTID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN,
    });
    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM_ID,
    });
    const imgUrl = response.data.link;

    handleSuccess(res, 200, { imgUrl });
  }),
};

module.exports = uploadImageControllers;
