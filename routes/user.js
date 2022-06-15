const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user");
const { isAuth, checkReqParamsId } = require("../middleware/index");

router.get("/", isAuth, userControllers.getUsers);
router.post("/register", userControllers.register);
router.post("/login", userControllers.logIn);
router.get("/check", isAuth, userControllers.check);

module.exports = router;
