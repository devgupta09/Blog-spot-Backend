const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Blog = require("../models/Blog");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Get Secret-Key from .env file
require("dotenv").config();
const Secret_Key = process.env.Secret_Key;

// Signup API for creating a new user

router.post(
  "/signUp",
  [
    body("name", "Enter a valid name!").isLength({ min: 3 }),
    body("email", "Enter a vaid email!").isEmail(),
    body(
      "password",
      "Password should be contains atleast 5 characters!"
    ).isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry, user with email already exist!" });
      }

      const salt = await bcrypt.genSalt(5);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, Secret_Key);

      res.json({ authToken });
    } catch (err) {
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

// Signin API for login as a user

router.post(
  "/signIn",
  [
    body("email", "Enter a vaid email!").isEmail(),
    body("password", "Password can not be empty!").isLength({
      min: 1,
    }),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials!" });
      }

      const comparePasswords = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!comparePasswords) {
        return res.status(400).json({
          error: "Please try to login with correct credentials!",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      let name = user.name;

      let sessionTime = Date.now();
      user = await User.findByIdAndUpdate(
        user.id,
        { $set: { sessionTime: sessionTime } },
        { new: true }
      );

      const authToken = jwt.sign(data, Secret_Key);

      res.json({
        authToken: authToken,
        sessionTimeout: sessionTime,
        name: name,
      });
    } catch (err) {
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

// Verify User by auth-token

router.get("/getUserDetails", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const blogsCount = await Blog.countDocuments({ user: userId });
    let user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { totalBlogs: blogsCount } },
      { new: true, select: "-password" }
    );
    res.json(user);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

// Update User Details

router.post("/updateUserDetails", fetchUser, async (req, res) => {
  try {
    const { password, description } = req.body;

    const updatedUser = {};

    if (password && password != "") {
      const salt = await bcrypt.genSalt(5);
      const secPass = await bcrypt.hash(password, salt);
      updatedUser.password = secPass;
    }

    if (description && description != "") {
      updatedUser.description = description;
    }

    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send("NOT FOUND!");
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedUser },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

module.exports = router;
