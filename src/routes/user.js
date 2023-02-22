const express = require("express");
const router = express.Router();
const { userController } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/register/verification", userController.verificationOtp);
router.get("/", protect, userController.get);
router.post("/login", userController.login);

module.exports = router;
