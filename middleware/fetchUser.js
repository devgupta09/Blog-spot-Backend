const jwt = require("jsonwebtoken");

require("dotenv").config();
const Secret_Key = process.env.Secret_Key;

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using valid token!" });
  }
  try {
    const data = jwt.verify(token, Secret_Key);
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate using valid token!" });
  }
};

module.exports = fetchUser;
