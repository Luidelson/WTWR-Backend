const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} = require("../utils/errors");

const { STATUS_CREATED, STATUS_OK } = require("../utils/constants");

// POST /signup
const createUser = (req, res, next) => {
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
        next(new ConflictError("Email already exists"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid Data"));
      } else {
        next(new InternalServerError("an Error occured in the server."));
      }
    });
};

// GET /users/me
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id; // Get user ID from JWT payload

  User.findById(userId)
    .orFail()
    .then((user) => res.status(STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID"));
      } else {
        next(new InternalServerError("An error occurred in the server."));
      }
    });
};

// PATCH /users/me
const updateCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid Data"));
      } else if (err instanceof NotFoundError) {
        next(err);
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID"));
      } else {
        next(new InternalServerError("Error from updateCurrentUser"));
      }
    });
};

// POST /signin
const login = (req, res, next) => {
  const { email, password } = req.body;

  // Scenario 1: Check if email or password is missing
  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  // Scenario 2: Both email and password provided, but they might be incorrect
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // Create JWT with only _id in the payload, expires in 7 days
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Create user object without password
      const userObj = user.toObject();
      delete userObj.password;

      res.status(STATUS_OK).send({ token, user: userObj });
    })
    .catch((err) => {
      // Check if the error is specifically about incorrect credentials
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(new InternalServerError("An error occurred on the server"));
      }
    });
};

module.exports = {
  // getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  login,
};
