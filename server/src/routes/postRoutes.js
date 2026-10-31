
const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a post
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const post = await Post.create({
      author: req.userId,
      content: content.trim(),
    });

    const populatedPost = await post.populate("author", "name email");

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like or unlike a post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.userId
    );

    if (alreadyLiked) {
      post.likes.pull(req.userId);
    } else {
      post.likes.addToSet(req.userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.userId,
      text: text.trim(),
    });

    await post.save();

    await post.populate("comments.user", "name");

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
