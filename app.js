const express = require("express");

const mongoose = require("mongoose");
// const mainRouter = require("./routes/users");

// Add an empty line here to satisfy the lint rule

const app = express();

const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

app.use((req, res, next) => {
  req.user = { _id: "64b7e6e2f1a2c2a1b2c3d4e5" };
  next();
});

app.use(express.json());

const routes = require("./routes/index");

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
