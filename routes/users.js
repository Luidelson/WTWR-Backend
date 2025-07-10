const express = require("express");
const { getUsers, createUser, getUser } = require("../controllers/users");

const router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUser);
router.post("/", createUser);

module.exports = router;
