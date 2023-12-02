const mongoose = require("mongoose");

const mongooURI = "mongodb://localhost:27017/blogspot";

const connectToMongo = () => {
  mongoose.connect(mongooURI);
};

module.exports = connectToMongo;
