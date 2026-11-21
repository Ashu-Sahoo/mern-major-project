const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const validatePostInput = require("../utils/validatePost");

const router = express.Router();

// GET /api/posts — return newest posts first
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error.message);
    res.status(500).json({ message: "Unable to fetch posts." });
  }
});

// GET /api/posts/:id — return one post
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Get post error:", error.message);
    return res.status(500).json({ message: "Unable to fetch post." });
  }
});

// POST /api/posts — create a post
router.post("/", async (req, res) => {
  const validation = validatePostInput(req.body);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const post = await Post.create({
      title: validation.title,
      content: validation.content,
      author: typeof req.body.author === "string" && req.body.author.trim()
        ? req.body.author.trim()
        : "Anonymous",
      category: typeof req.body.category === "string" && req.body.category.trim()
        ? req.body.category.trim()
        : "General"
    });

    return res.status(201).json({
      message: "Blog post created successfully.",
      post
    });
  } catch (error) {
    console.error("Create post error:", error.message);
    return res.status(500).json({ message: "Unable to create post." });
  }
});

// DELETE /api/posts/:id — delete a post
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete post error:", error.message);
    return res.status(500).json({ message: "Unable to delete post." });
  }
});

module.exports = router;
