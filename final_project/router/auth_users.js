const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "user_1", password: "pass_1" }];

const SECRET_KEY = "jwtSecretKey";

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization header missing" });
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

  return res.status(200).json({
    message: "Login successful",
    token: token,
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username;

  if (!review || typeof review !== "string" || review.trim() === "") {
    return res.status(400).json({ message: "Review text is required" });
  }

   let book = null
  for (let key in books) {
    if (books[key].ISBN === isbn) {
      book = books[key];
      break;
    }
  }

  if (book) {
    book.reviews[username] = review.trim();
    return res
      .status(200)
      .json({ message: "Review successfully posted", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

//Delete a Book Review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  let book = null

  for (let key in books) {
    if (books[key].ISBN === isbn) {
      book = books[key];
      break;
    }
  }

  if (book) {
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res
        .status(200)
        .json({
          message: "Review successfully deleted",
          reviews: book.reviews,
        });
    } else {
      return res
        .status(404)
        .json({ message: "No review by this user to delete" });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
