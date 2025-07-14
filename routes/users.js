const express = require("express");
const {
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");
const router = express.Router();

router.get("/", getUsers);
router.get("/me", getCurrentUser);
router.post("/", createUser);
router.patch("/me", updateCurrentUser);
