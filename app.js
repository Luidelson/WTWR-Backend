const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
const { errors } = require("celebrate");
const { requestLogger, errorLogger } = require("./middlewares/logger");
require("dotenv").config();

const app = express();

const { PORT = 3001 } = process.env;
const userRouter = require("./routes/users");
const itemRouter = require("./routes/clothingItems");
const { STATUS_NOT_FOUND } = require("./utils/constants");

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json());
app.use(cors());

// Public routes
app.post("/signin", require("./controllers/users").login);
app.post("/signup", require("./controllers/users").createUser);
app.get("/items", require("./controllers/clothingItems").getItems);

// Protect all routes below this line
app.use(requestLogger); // Log requests
// Protected routes
app.use("/users", userRouter);
app.use("/items", itemRouter);

app.use(errorLogger); // Log errors

app.use(errors()); // Celebrate error handling

// Error handling middleware
app.use(errorHandler);

app.use((req, res) => {
  res
    .status(STATUS_NOT_FOUND)
    .send({ message: "Requested resource not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
