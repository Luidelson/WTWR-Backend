const router = require("express").Router();

const STATUS_NOT_FOUND = 404;

const clothingItem = require("./clothingItems");

const userRouter = require("./users");

router.use("/users", userRouter);

router.use("/items", clothingItem);

router.use((req, res) => {
  res
    .status(STATUS_NOT_FOUND)
    .send({ message: "Requested resource not found" });
});

module.exports = router;
