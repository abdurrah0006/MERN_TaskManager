const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const HttpError = require("../utils/HttpError");

const MIN_PASSWORD = 6;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const authResponse = (user) => ({ user: user.toPublic(), token: generateToken(user._id) });

exports.registerUser = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    throw new HttpError(400, "Name, email and password are required");
  }
  if (password.length < MIN_PASSWORD) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
  }
  if (await User.exists({ email })) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(authResponse(user));
};

exports.loginUser = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.json(authResponse(user));
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toPublic() });
};

exports.updateProfile = async (req, res) => {
  const name = String(req.body.name ?? req.user.name).trim();
  const email = normalizeEmail(req.body.email ?? req.user.email);

  if (!name || !email) throw new HttpError(400, "Name and email are required");

  if (email !== req.user.email && (await User.exists({ email }))) {
    throw new HttpError(409, "An account with this email already exists");
  }

  req.user.name = name;
  req.user.email = email;
  await req.user.save();

  res.json({ user: req.user.toPublic() });
};

exports.changePassword = async (req, res) => {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (newPassword.length < MIN_PASSWORD) {
    throw new HttpError(400, `New password must be at least ${MIN_PASSWORD} characters`);
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    throw new HttpError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated" });
};
