const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");
require("dotenv");

// Connect To Mongo DB
connectToMongo();

const app = express();
app.use(cors());
app.use(express.json());

// Set PORT APP listening to
const port = process.env.PORT;

app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/blog"));

// Basic get API
app.get("/", (req, res) => {
  res.send("Welcome to Blog-spot Application!");
});

app.listen(port, () => {
  console.log(`App listening to port ${port}`);
});

module.exports = app;
