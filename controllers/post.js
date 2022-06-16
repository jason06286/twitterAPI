const Post = require("../models/PostsModel");

const { appError } = require("../service/handleError");
const handleSuccess = require("../service/handleSuccess");
const handleErrorAsync = require("../service/handleErrorAsync");
const decoding = require("../service/decodingJWT");

const postControllers = {
  getAllPosts: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Posts']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '取得所有貼文內容'
      * #swagger.responses[200] = {
          description: '所有貼文內容',
        }
      * #swagger.responses[401] = {
          description: '未授權',
        }
      }
    */
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
    const posts = await Post.find(q)
      .populate({
        path: "user",
        select: "name photo ",
      })
      .populate({
        path: "shares",
      })
      .sort(timeSort);

    handleSuccess(res, 200, posts);
  }),
  getUserPosts: handleErrorAsync(async (req, res, next) => {
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
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
    const posts = await Post.find({
      user: {
        _id: id,
      },
    })
      .populate({
        path: "user",
        select: "name photo ",
      })
      .populate({
        path: "shares",
      })
      .sort(timeSort);

    console.log("posts :>> ", posts);
    if (!posts.length) {
      return appError(400, "查無此使用者，請輸入正確ID", next);
    }

    handleSuccess(res, 200, posts);
  }),
  getPost: handleErrorAsync(async (req, res, next) => {
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
    const post = await Post.findById(id)
      .populate({
        path: "user",
        select: "name photo ",
      })
      .populate({
        path: "shares",
      });

    if (!post) {
      return appError(400, "查無此貼文，請輸入正確ID", next);
    }

    handleSuccess(res, 200, post);
  }),
  addPost: handleErrorAsync(async (req, res, next) => {
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

    const { content, images } = req.body;
    const currentUser = await decoding(req);
    if (!content && !images?.length) {
      return appError(422, "請填寫貼文內容", next);
    }
    console.log("currentUser :>> ", currentUser.id);
    console.log("content :>> ", content);
    console.log("images :>> ", images);
    const addPost = await Post.create({
      user: currentUser.id,
      content,
      images,
    });
    handleSuccess(res, 201, addPost);
  }),
  deletePost: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Posts']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '刪除單筆貼文'
      * #swagger.responses[200] = {
          description: '刪除單筆貼文成功',
        }
      * #swagger.responses[401] = {
          description: '沒有權限',
        }
      }
    */
    const { id } = req.params;
    await Post.deleteMany({
      shares: id,
    });
    const deletePost = await Post.findByIdAndDelete(id);
    if (!deletePost) {
      return appError(400, "無此帖文，請輸入正確的ID", next);
    }
    handleSuccess(res, 200, null, "刪除單筆貼文成功!");
  }),
  updatePost: handleErrorAsync(async (req, res, next) => {
    /**
      * #swagger.tags = ['Posts']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = '編輯單筆貼文'
        #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { "post": {
                            "content": "string",
                            } }
            }
      * #swagger.responses[201] = {
          description: '編輯後的貼文',
        }
      * #swagger.responses[422] = {
          description: '資料填寫錯誤',
        }
      }
    */
    const { id } = req.params;
    const { content, images } = req.body;
    if (!content && !images?.length) {
      return appError(400, "請輸入要更新的貼文內容或圖片", next);
    }
    const newPost = await Post.findByIdAndUpdate(
      id,
      { content, images },
      { new: true }
    );
    if (!newPost) {
      return appError(400, "無此帖文，請輸入正確的ID", next);
    }

    handleSuccess(res, 201, newPost);
  }),
};

module.exports = postControllers;
