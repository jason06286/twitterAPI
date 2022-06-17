const Follow = require("../models/FollowModel");

const { appError } = require("../service/handleError");
const handleSuccess = require("../service/handleSuccess");
const handleErrorAsync = require("../service/handleErrorAsync");
const decoding = require("../service/decodingJWT");

const followControllers = {
  getFollow: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Posts']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '取得所有個人貼文'
      * #swagger.responses[200] = {
          description: '所有個人貼文',
        }
      * #swagger.responses[401] = {
          description: '未授權',
        }
      }
    */
    const { id } = req.params;
    const follow = await Follow.findOne({ userId: id })
      .populate({
        path: "following",
        populate: { path: "user" },
      })
      .populate({
        path: "follower",
        populate: { path: "user" },
      });
    if (!follow) {
      return appError(400, "查無此使用者，請輸入正確ID", next);
    }

    handleSuccess(res, 200, follow);
  }),
  updateFollow: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Posts']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '新增貼文'
        #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { "post": {
                            "user": "userId",
                            "content": "string"
                            } }
            }
      * #swagger.responses[201] = {
          description: '新增的貼文',
        }
      * #swagger.responses[422] = {
          description: '資料填寫錯誤',
        }
      }
    */

    const { id } = req.params;
    const currentUser = await decoding(req);

    if (id === currentUser.id) {
      return appError(400, "無法追蹤自己，請輸入正確的使用者ID", next);
    }
    const isFollow = await Follow.findOne({
      userId: currentUser.id,
      "following.user": id,
    });
    let method = "";

    if (isFollow) {
      method = "$pull";
    } else {
      method = "$push";
    }
    const adminFollow = await Follow.findOneAndUpdate(
      { userId: currentUser.id },
      { [method]: { following: { user: id } } },
      { new: true }
    );
    const otherFollow = await Follow.findOneAndUpdate(
      { userId: id },
      { [method]: { follower: { user: currentUser.id } } },
      { new: true }
    );
    const follows = {
      adminFollow,
      otherFollow,
    };
    handleSuccess(res, 201, follows);
  }),
};

module.exports = followControllers;
