const express = require("express");
const {
  createItem,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItems");

const auth = require("../middlewares/auth");
const { validateCardBody, validateItemId } = require("../middlewares/validation");

const router = express.Router();

// Protect all routes in this router
router.use(auth);

// Only protected routes (GET /items is public and handled in app.js)
router.post("/", validateCardBody, createItem);
router.delete("/:itemId", validateItemId, deleteItem);
router.put("/:itemId/likes", validateItemId, likeItem);
router.delete("/:itemId/likes", validateItemId, unlikeItem);

module.exports = router;
