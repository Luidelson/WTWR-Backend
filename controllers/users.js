const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const {
  STATUS_NOT_FOUND,
  STATUS_BAD_REQUEST,
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_CREATED,
  STATUS_OK,
  STATUS_CONFLICT,
} = require("../utils/constants");

// GET /users
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

// POST /signup
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      res.status(STATUS_CREATED).send(userObj);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res
          .status(STATUS_CONFLICT)
          .send({ message: "Email already exists" });
      }
      if (err.name === "ValidationError") {
        return res.status(STATUS_BAD_REQUEST).send({ message: "Invalid Data" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "an Error occured in the server." });
    });
};

// GET /users/me
const getCurrentUser = (req, res) => {
  const userId = req.user._id; // Get user ID from JWT payload

  User.findById(userId)
    .orFail()
    .then((user) => res.status(STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(STATUS_NOT_FOUND).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ message: "Invalid user ID" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred in the server." });
    });
};

// PATCH /users/me
const updateCurrentUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(STATUS_NOT_FOUND).send({ message: "User not found" });
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(STATUS_BAD_REQUEST).send({ message: "Invalid Data" });
      }
      return res
        .status(STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred in the server." });
    });
};

// POST /signin
const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // Create JWT with only _id in the payload, expires in 7 days
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(STATUS_OK).send({ token });
    })
    .catch(() => {
      res.status(401).send({ message: "Incorrect email or password" });
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  login,
};
