const express = require("express");

const {
  getUsers,
  getCurrentUser,
  updateCurrentUser,
  createUser,
} = require("../controllers/users");

const router = express.Router();

router.get("/", getUsers);
router.get("/me", getCurrentUser);
router.post("/", createUser);
router.patch("/me", updateCurrentUser);

module.exports = router;
