const ClothingItem = require("../models/clothingItem");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
} = require("../utils/errors");

const {
  STATUS_OK,
} = require("../utils/constants");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid item data"));
      } else {
        next(new InternalServerError("Error from createItem"));
      }
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(STATUS_OK).send(items))
    .catch((err) => {
      console.error("Error in getItems:", err);
      // If it's a connection error, return empty array instead of error
      if (err.name === "MongooseServerSelectionError") {
        console.log("Database not available, returning empty items array");
        return res.status(STATUS_OK).send([]);
      }
      return next(new InternalServerError("An error occurred in the server."));
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }
      // Check if the current user is the owner
      if (item.owner.toString() !== userId) {
        throw new ForbiddenError("You are not allowed to delete this item");
      }
      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) =>
        res
          .status(STATUS_OK)
          .send({ message: "Item deleted successfully", data: deletedItem })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else if (
        err instanceof NotFoundError ||
        err instanceof ForbiddenError
      ) {
        next(err);
      } else {
        next(new InternalServerError("Error from deleteItem"));
      }
    });
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }
      return res.status(STATUS_OK).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else if (err instanceof NotFoundError) {
        next(err);
      } else {
        next(new InternalServerError("Error from likeItem"));
      }
    });
};

const unlikeItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }
      return res.status(STATUS_OK).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else if (err instanceof NotFoundError) {
        next(err);
      } else {
        next(new InternalServerError("Error from unlikeItem"));
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
