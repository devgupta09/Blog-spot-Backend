const { body, validationResult } = require("express-validator");
const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Blog = require("../models/Blog");
const User = require("../models/User");
const router = express.Router();

// Add All Blogs

router.get("/getAllBlogs", fetchUser, async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

// Get all Blogs Corresponding to the user

router.get("/getMyBlogs", fetchUser, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user.id });
    res.json(blogs);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

// Add new blog for the user

router.post(
  "/addBlog",
  fetchUser,
  [
    body("title", "Title should be contains atleast 3 characters!").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description should be contains atleast 5 characters!"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }
      const { title, description } = req.body;
      let { name } = await User.findById(req.user.id);
      const blog = await Blog.create({
        user: req.user.id,
        title,
        description,
        author: name,
      });
      res.json(blog);
    } catch (err) {
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

// Get Blog Details

router.put("/getBlogDetails/:id", fetchUser, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("NOT FOUND!");
    }
    res.json(blog);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

// Update a Blog

router.put(
  "/updateBlog/:id",
  [
    body("title", "Title should be contains atleast 3 characters!").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description should be contains atleast 5 characters!"
    ).isLength({ min: 5 }),
    body("author", "Author should be contains atleast a character!").isLength({
      min: 1,
    }),
  ],
  fetchUser,
  async (req, res) => {
    try {
      const { author, title, description } = req.body;

      const newBlog = {};

      if (title) {
        newBlog.title = title;
      }
      if (description) {
        newBlog.description = description;
      }
      if (author) {
        newBlog.author = author;
      }

      let blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).send("NOT FOUND!");
      }

      if (blog.user.toString() !== req.user.id) {
        return res.status(401).send("NOT ALLOWED!");
      }

      blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: newBlog },
        { new: true }
      );
      res.json({ blog });
    } catch (err) {
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

// Delete a Blog

router.delete("/deleteBlog/:id", fetchUser, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("NOT FOUND!");
    }
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).send("NOT ALLOWED!");
    }

    blog = await Blog.findByIdAndDelete(req.params.id);

    res.json({ success: "Blog has been Deleted Successfully!", blog: blog });
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

module.exports = router;
