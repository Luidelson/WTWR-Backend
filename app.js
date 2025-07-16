const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const { PORT = 3001 } = process.env;
const userRouter = require("./routes/users");
const itemRouter = require("./routes/clothingItems");

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

app.use(express.json());
app.use(cors());

// Public routes
app.post("/signin", require("./controllers/users").login);
app.post("/signup", require("./controllers/users").createUser);
app.get("/items", require("./controllers/clothingItems").getItems);

// Protect all routes below this line

// Protected routes
app.use("/users", userRouter);
app.use("/items", itemRouter);

app.use((req, res) => {
  res.status(404).send({ message: "Requested resource not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
