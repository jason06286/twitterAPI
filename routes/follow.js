const express = require("express");
const router = express.Router();

const followControllers = require("../controllers/follow");

const { isAuth, checkReqParamsId } = require("../middleware/index");

router.get("/:id", isAuth, checkReqParamsId, followControllers.getFollow);

router.patch("/:id", isAuth, checkReqParamsId, followControllers.updateFollow);

module.exports = router;
