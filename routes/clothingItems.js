const express = require("express");
const {
  createItem,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItems");

const auth = require("../middlewares/auth");

const router = express.Router();

// Protect all routes in this router
router.use(auth);

// Only protected routes (GET /items is public and handled in app.js)
router.post("/", createItem);
router.delete("/:itemId", deleteItem);
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", unlikeItem);

module.exports = router;
