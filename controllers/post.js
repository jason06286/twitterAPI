/* eslint-disable consistent-return */
const Post = require('../models/PostsModel');
const Comment = require('../models/CommentModel');

const { appError } = require('../service/handleError');
const handleSuccess = require('../service/handleSuccess');
const handleErrorAsync = require('../service/handleErrorAsync');
const decoding = require('../service/decodingJWT');

const postControllers = {
  getAllPosts: handleErrorAsync(async (req, res) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt';

    const posts = await Post.find({ share: { $exists: false } })
      .populate({
        path: 'user',
        select: 'name photo ',
      })
      .populate({
        path: 'comments',
      })
      .sort(timeSort);

    handleSuccess(res, 200, posts);
  }),
  getUserPosts: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt';
    const posts = await Post.find({
      user: {
        _id: id,
      },
    })
      .populate({
        path: 'user',
        select: 'name photo ',
      })
      .populate({
        path: 'share',
      })
      .populate({
        path: 'comments',
      })
      .sort(timeSort);

    if (!posts.length) {
      return appError(400, '查無此使用者，請輸入正確ID', next);
    }

    handleSuccess(res, 200, posts);
  }),
  getPost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate({
        path: 'user',
        select: 'name photo ',
      })
      .populate({
        path: 'share',
      })
      .populate({
        path: 'comments',
      });

    if (!post) {
      return appError(400, '查無此貼文，請輸入正確ID', next);
    }

    handleSuccess(res, 200, post);
  }),
  getPostLikes: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id).populate({
      path: 'likes',
    });

    if (!post) {
      return appError(400, '查無此貼文，請輸入正確ID', next);
    }
    const postLikes = post.likes;

    handleSuccess(res, 200, postLikes);
  }),
  getPostComments: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id).populate({
      path: 'comments',
    });

    if (!post) {
      return appError(400, '查無此貼文，請輸入正確ID', next);
    }
    const postComments = post.comments;

    handleSuccess(res, 200, postComments);
  }),
  addPost: handleErrorAsync(async (req, res, next) => {
    const { content, images } = req.body;
    const currentUser = await decoding(req);
    if (!content && !images?.length) {
      return appError(422, '請填寫貼文內容', next);
    }
    const addPost = await Post.create({
      user: currentUser.id,
      content,
      images,
    });
    handleSuccess(res, 201, addPost);
  }),
  deletePost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    await Post.deleteMany({
      share: id,
    });
    const deletePost = await Post.findByIdAndDelete(id);
    if (!deletePost) {
      return appError(400, '無此帖文，請輸入正確的ID', next);
    }
    handleSuccess(res, 200, null, '刪除單筆貼文成功!');
  }),
  updatePost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const { content, images } = req.body;
    if (!content && !images?.length) {
      return appError(400, '請輸入要更新的貼文內容或圖片', next);
    }
    const newPost = await Post.findByIdAndUpdate(
      id,
      { content, images },
      { new: true },
    ).populate({
      path: 'user',
      select: 'name photo ',
    });
    if (!newPost) {
      return appError(400, '無此帖文，請輸入正確的ID', next);
    }

    handleSuccess(res, 201, newPost);
  }),
  sharePost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentUser = await decoding(req);
    const post = await Post.findById(id);
    if (!post) {
      return appError(400, '無此貼文，請輸入正確的貼文ID', next);
    }
    await Post.create({
      user: currentUser.id,
      share: id,
    });
    handleSuccess(res, 201, null, '分享貼文成功!');
  }),
  updatePostLikes: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentUser = await decoding(req);
    const post = await Post.findById(id);
    let method = '';

    if (!post) {
      return appError(400, '無此貼文，請輸入正確的貼文ID', next);
    }
    if (post.likes.includes(currentUser.id)) {
      method = '$pull';
    } else {
      method = '$push';
    }
    const newPost = await Post.findByIdAndUpdate(
      id,
      { [method]: { likes: currentUser.id } },
      { new: true },
    ).populate({
      path: 'likes',
    });
    handleSuccess(res, 201, newPost);
  }),
  addPostComments: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentUser = await decoding(req);
    const { content } = req.body;
    if (!content) {
      return appError(400, '請輸入留言內容', next);
    }
    const post = await Post.findById(id);

    if (!post) {
      return appError(400, '無此貼文，請輸入正確的貼文ID', next);
    }

    const newComment = await Comment.create({
      commenter: currentUser.id,
      post: id,
      content,
    });
    handleSuccess(res, 201, newComment);
  }),
};

module.exports = postControllers;
