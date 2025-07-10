const User = require("../models/user");

const STATUS_NOT_FOUND = 404;
const STATUS_BAD_REQUEST = 400;
const STATUS_INTERNAL_SERVER_ERROR = 500;
const STATUS_CREATED = 201;
const STATUS_OK = 200;

// GET .users

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(STATUS_OK).send(users))
    .catch((err) => {
      console.error(err);
      res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "an Error occured in the server." });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.status(STATUS_CREATED).send(user))
    .catch((err) => {
      console.error(err);
      console.error(err.name);
      if (err.name === "ValidationError") {
        res.status(STATUS_BAD_REQUEST).send({ message: "Invalid Data" });
      } else {
        res
          .status(STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: "an Error occured in the server." });
      }
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(STATUS_OK).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(STATUS_NOT_FOUND)
          .send({ message: "an Error occured in the server." });
      }
      if (err.name === "CastError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid Parameters" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "an Error occured in the server." });
    });
};

module.exports = { getUsers, createUser, getUser };
