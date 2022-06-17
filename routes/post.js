const express = require("express");
const router = express.Router();

const postControllers = require("../controllers/post");

const { isAuth, checkReqParamsId } = require("../middleware/index");

router.get("/posts", isAuth, postControllers.getAllPosts);
router.get(
  "/posts/user/:id",
  isAuth,
  checkReqParamsId,
  postControllers.getUserPosts
);

router.get("/post/:id", isAuth, checkReqParamsId, postControllers.getPost);
router.get(
  "/post/:id/likes",
  isAuth,
  checkReqParamsId,
  postControllers.getPostLikes
);

router.post("/post/", isAuth, postControllers.addPost);
router.post(
  "/post/share/:id",
  isAuth,
  checkReqParamsId,
  postControllers.sharePost
);

router.delete(
  "/post/:id",
  isAuth,
  checkReqParamsId,
  postControllers.deletePost
);

router.patch("/post/:id", isAuth, checkReqParamsId, postControllers.updatePost);
router.patch(
  "/post/:id/likes",
  isAuth,
  checkReqParamsId,
  postControllers.updatePostLikes
);

module.exports = router;
