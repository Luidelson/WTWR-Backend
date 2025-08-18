const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const errorHandler = require("./middlewares/errorHandler");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const {
  validateUserSignin,
  validateUserSignup,
  validateCardBody,
  validateItemId,
} = require("./middlewares/validation");
const { NotFoundError } = require("./utils/errors");
const auth = require("./middlewares/auth");
require("dotenv").config();

const app = express();

const { PORT = 3001, MONGODB_URI = "mongodb://127.0.0.1:27017/wtwr_db" } =
  process.env;
const userRouter = require("./routes/users");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://firstdomain.jumpingcrab.com",
      "https://www.firstdomain.jumpingcrab.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(requestLogger); // Log requests

// Public routes
app.get("/items", require("./controllers/clothingItems").getItems);
app.post("/signin", validateUserSignin, require("./controllers/users").login);
app.post(
  "/signup",
  validateUserSignup,
  require("./controllers/users").createUser
);

// Crash test endpoint for testing server configuration
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

// Protected routes (must come AFTER public routes)
app.use("/users", userRouter);

// Protected item routes
app.post("/items", auth, validateCardBody, require("./controllers/clothingItems").createItem);
app.delete("/items/:itemId", auth, validateItemId, require("./controllers/clothingItems").deleteItem);
app.put("/items/:itemId/likes", auth, validateItemId, require("./controllers/clothingItems").likeItem);
app.delete("/items/:itemId/likes", auth, validateItemId, require("./controllers/clothingItems").unlikeItem);

app.use(errors()); // Celebrate error handling

app.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

app.use(errorLogger); // Log errors

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
