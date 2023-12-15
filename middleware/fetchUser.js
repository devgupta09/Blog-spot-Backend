const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config();
const Secret_Key = process.env.Secret_Key;

const fetchUser = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      res.status(401).send({ error: "Please authenticate using valid token!" });
    }
    const data = jwt.verify(token, Secret_Key);
    const user = await User.findById(data.user.id).select("-password");
    let currTime = Date.now();
    const timeDiff = currTime - user.sessionTime;
    if (timeDiff > 30 * 60 * 1000) {
      return res
        .status(401)
        .send({ status: 401, error: "Authorization Token Expired!" });
    }
    req.user = data.user;
    next();
  } catch (err) {
    res.status(400).send("Not Found!");
  }
};

module.exports = fetchUser;
