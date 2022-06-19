const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");

const { isAuth, checkReqParamsId } = require("../middleware/index");

router.get("/", isAuth, userControllers.getUsers);
router.post("/register", userControllers.register);
router.post("/login", userControllers.logIn);
router.get("/check", isAuth, userControllers.check);

router.get(
  "/profile/:id",
  isAuth,
  checkReqParamsId,
  userControllers.getProfile
);
router.patch("/profile", isAuth, userControllers.updateProfile);
router.patch("/updatePassword", isAuth, userControllers.updatePassword);

module.exports = router;
