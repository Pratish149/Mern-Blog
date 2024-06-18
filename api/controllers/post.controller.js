const { errorHandler } = require("../utils/error");
const Post = require("../models/post.model");

const create = async (req, res, next) => {
  const { title, content } = req?.body || {};
  const { isAdmin } = req?.user || {};
  if (!isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  if (!title || !content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json({
      status: "SUCCESS",
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};
