const express = require("express");

const { getCurrentUser, updateCurrentUser } = require("../controllers/users");

const auth = require("../middlewares/auth");
const { validateUserUpdate } = require("../middlewares/validation");

const router = express.Router();

router.use(auth);

router.get("/me", getCurrentUser);
router.patch("/me", validateUserUpdate, updateCurrentUser);

module.exports = router;
