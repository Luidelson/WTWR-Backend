const router = require("express").Router();

const STATUS_NOT_FOUND = 404;

const { createUser } = require("../controllers/users");
const clothingItem = require("./clothingItems");

const userRouter = require("./users");

router.use("/users", userRouter);

router.use("/items", clothingItem);

router.use((req, res) => {
  res
    .status(STATUS_NOT_FOUND)
    .send({ message: "Requested resource not found" });
});

app.post("/signup", createUser);
app.post("/signin", login);

module.exports = router;
