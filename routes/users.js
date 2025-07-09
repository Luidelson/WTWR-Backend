const { getUsers, createUser, getUser } = require("../controllers/users");
const express = require("express");
const router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUser);
router.post("/", createUser);

module.exports = router;
