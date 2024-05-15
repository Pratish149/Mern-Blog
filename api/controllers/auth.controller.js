const User = require("../models/user.model.js");
const { errorHandler } = require("../utils/error.js");
const bcrypt = require("bcryptjs");

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(200).json({ status: "SUCCESS", message: "Signup successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
};
