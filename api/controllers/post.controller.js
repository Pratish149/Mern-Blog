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

const getPosts = async (req, res, next) => {
  try {
    const {
      startIndex,
      limit,
      order,
      userId,
      category,
      slug,
      postId,
      searchTerm,
    } = req?.query || {};
    const index = parseInt(startIndex || "0");
    const limitRequired = parseInt(limit || "9");
    const sortDirection = order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(userId && { userId }),
      ...(category && { category }),
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(index)
      .limit(limitRequired);

    const totalPosts = await Post.countDocuments();

    const currentTime = new Date();
    const oneMonthAgoTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth() - 1,
      currentTime.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgoTime },
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Posts fetched successfully",
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  const { userId, postId } = req.params;
  const { id, isAdmin } = req?.user || {};
  if (!isAdmin || userId !== id) {
    return next(errorHandler(403, "You are not allowed to delete this post"));
  }
  try {
    await Post.findByIdAndDelete(postId);
    res.status(200).json({
      status: "SUCCESS",
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  const { title, content, category, image } = req?.body || {};
  const { userId, postId } = req.params;
  const { id, isAdmin } = req?.user || {};
  if (!isAdmin || userId !== id) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          title,
          content,
          category,
          image,
        },
      },
      { new: true }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getPosts,
  deletePost,
  updatePost,
};
