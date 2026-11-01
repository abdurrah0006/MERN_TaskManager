const jwt = require("jsonwebtoken");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");

const protect = async (req, _res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new HttpError(401, "Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Not authorized, token failed");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, "Not authorized, user no longer exists");

  req.user = user;
  next();
};

module.exports = protect;
