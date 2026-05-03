const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };