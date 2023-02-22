const { response } = require("../middlewares/response");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../helpers/jwt");

let key = process.env.KEY;

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      let auth = req.headers.authorization;
      token = auth.split(" ")[1];
      const payload = await verifyToken(token);
      console.log("payload verify token", payload);
      req.payload = payload;
      next();
    } else {
      response(res, 400, false, null, "Server need token");
    }
  } catch (err) {
    if (err && err.name == "JsonWebTokenError") {
      return response(res, 400, false, null, "Invalid token");
    } else if (err && err.name == "TokenExpiredError") {
      return response(res, 400, false, null, "Expired token");
    } else {
      return response(res, 400, false, null, "Token deactivate");
    }
  }
};

module.exports = {
  protect,
};
