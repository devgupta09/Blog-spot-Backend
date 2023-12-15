const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: { type: String, required: false, default: "" },
  createdAt: { type: Date, default: Date.now },
  sessionTime: { type: Date },
  totalBlogs: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", userSchema);
