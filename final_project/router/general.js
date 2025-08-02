const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = {
    username: username,
    password: password,
  };

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const data = await cb((resolve) => {
      const listOfBooks = Object.values(books);
      resolve(listOfBooks);
    }, 3000);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.trim().toLowerCase();
    let booksAuthor = [];

    for (let key in books) {
      if (books[key].author.toLowerCase() === author) {
        booksAuthor.push({ isbn: Number(key), ...books[key] });
      }
    }

    if (booksAuthor.length > 0) {
      return res.status(200).json({ bookByAuthor: booksAuthor });
    } else {
      return res.status(404).send("No books found");
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  let title = req.params.title.toLocaleLowerCase();
  let booksTitle = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      booksTitle.push(books[key]);
      books[key].isbn = key;
    }
  }

  if (booksTitle.length > 0) {
    return res.status(200).json({ booksByTitle: booksTitle });
  } else {
    return res.status(404).send("No books found");
  }
});



//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  let book = null;

  for (let key in books) {
    if (key === isbn) {
      book = books[key];
      break;
    }
  }

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).send("Book not found");
  }
});

module.exports.general = public_users;
