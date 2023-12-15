const mongoose = require("mongoose");
require("dotenv").config();

const mongooURI = process.env["MOONGODB_URI"];

const connectToMongo = () => {
  mongoose.connect(mongooURI);
  console.log("Connected to Moongo DataBase!");
};

module.exports = connectToMongo;
