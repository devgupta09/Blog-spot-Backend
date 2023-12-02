const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Get Secret-Key from .env file 
require("dotenv").config();
const Secret_Key = process.env["Secret_Key"];

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
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
  "/signin",
  [
    body("email", "Enter a vaid email!").isEmail(),
    body("password", "Password can not be empty!").isLength({
      min: 1,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
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

      const authToken = jwt.sign(data, Secret_Key);

      res.json({ authToken });
    } catch (err) {
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

// Verify User by auth-token

router.get("/", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

module.exports = router;
