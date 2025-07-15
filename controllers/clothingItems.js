const ClothingItem = require("../models/clothingItem");

const {
  STATUS_NOT_FOUND,
  STATUS_BAD_REQUEST,
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_OK,
} = require("../utils/constants");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid item data" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Error from createItem" });
    });
};

const getItems = (req, res) =>
  ClothingItem.find({})
    .then((items) => res.status(STATUS_OK).send(items))
    .catch(() =>
      res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred in the server." })
    );

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        return res.status(STATUS_NOT_FOUND).send({ message: "Item not found" });
      }
      // Check if the current user is the owner
      if (item.owner.toString() !== userId) {
        return res
          .status(403)
          .send({ message: "You are not allowed to delete this item" });
      }
      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) =>
        res
          .status(STATUS_OK)
          .send({ message: "Item deleted successfully", data: deletedItem })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid item ID" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Error from deleteItem" });
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(STATUS_NOT_FOUND).send({ message: "Item not found" });
      }
      return res.status(STATUS_OK).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid item ID" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred in the server." });
    });
};

const unlikeItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(STATUS_NOT_FOUND).send({ message: "Item not found" });
      }
      return res.status(STATUS_OK).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid item ID" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred in the server." });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
