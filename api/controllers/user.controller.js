const User = require("../models/user.model");
const { errorHandler } = require("../utils/error");
const bcrypt = require("bcryptjs");

const test = (req, res) => {
  res.json({
    message: "Api is working",
  });
};

const updateUser = async (req, res, next) => {
  const { user, params, body } = req || {};
  const { id } = user || {};
  const { userId } = params || {};
  const { username, password, email, profilePicture } = body || {};
  let updatedPassword = undefined;

  if (id !== userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (password !== undefined) {
    if (password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long")
      );
    }
    updatedPassword = bcrypt.hashSync(password, 10);
  }
  if (username !== undefined) {
    if (username.length < 7 || username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (username !== username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username,
          password: updatedPassword,
          email,
          profilePicture,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({
      status: "SUCCESS",
      data: rest,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { user, params } = req || {};
  const { id } = user || {};
  const { userId } = params || {};
  if (id !== userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      status: "SUCCESS",
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const signOut = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ status: "SUCCESS", message: "User has been signed out" });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  const { isAdmin } = req.user || {};
  const { startIndex, limit, sort } = req.query || {};
  if (!isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const index = parseInt(startIndex || "0");
    const limitRequired = parseInt(limit || "9");
    const sortDirection = sort === "asc" ? 1 : -1;
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(index)
      .limit(limitRequired);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const currentTime = new Date();
    const oneMonthAgoTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth() - 1,
      currentTime.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgoTime },
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Users fetched successfully",
      totalUsers,
      lastMonthUsers,
      users: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  test,
  updateUser,
  deleteUser,
  signOut,
  getUsers,
};
