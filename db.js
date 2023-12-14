const mongoose = require("mongoose");
require("dotenv").config();

const mongooURI = process.env["MOONGODB_URI"];

const connectToMongo = () => {
  mongoose.connect(mongooURI);
  console.log("Connect to Moongo DB!");
};

module.exports = connectToMongo;
