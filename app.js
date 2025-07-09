const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/users");

const app = express();

const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

const routes = require("./routes/index");
app.use("/", routes);

app.use(express.json());
app.use("/users", mainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
