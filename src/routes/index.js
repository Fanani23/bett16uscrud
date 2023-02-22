const express = require("express");
const router = express.Router();
const userRouter = require("../routes/user");

router.use("/users", userRouter);

module.exports = router;
