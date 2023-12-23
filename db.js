const mongoose = require("mongoose");
require("dotenv").config();

const mongooURI = process.env["DATABASE_URL"];

const connectToMongo = () => {
  mongoose.connect(mongooURI);
  console.log("Connected to Moongo DataBase!");
};

module.exports = connectToMongo;
