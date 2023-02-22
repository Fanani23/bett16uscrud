const jwt = require("jsonwebtoken");

let key = process.env.KEY;

const generateToken = (payload) => {
  const verifyOpts = {
    expiresIn: "1d",
  };
  const token = jwt.sign(payload, key, verifyOpts);
  return token;
};

const generateRefreshToken = (payload) => {
  const verifyOpts = {
    expiresIn: "1d",
  };
  const token = jwt.sign(payload, key, verifyOpts);
  return token;
};

const verifyToken = async (token) => {
  const res = await jwt.verify(token, key);
  return res;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};
