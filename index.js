const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");
require("dotenv");

// Connect To Mongo DB

connectToMongo();

const app = express();
app.use(cors());

// Set PORT APP listning to
const port = process.env["PORT"];

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/blog"));

// Basic get API

app.get("/", (req, res) => {
  res.send("Welcome to Blog-spot Application ! ");
});

console.log(port)

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
