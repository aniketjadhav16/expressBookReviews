const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BOOKS_API_URL = 'http://localhost:5000/';

public_users.post("/register", (req,res) => {
  const {username, password} = req.body

  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"})
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = {
    username: username,
    password: password
  }

  return res.status(200).json({message: "User registered successfully"})
});

public_users.get('/books-async', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API_URL);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  let book = null
  for (let key in books){
    if(books[key].ISBN === isbn){
      book = books[key]
      break;
    }
  }

  if(book){
    return res.status(200).json(book);
  } else {
    return res.status(404).send("Book not found")
  }
 });

public_users.get('/isbn-async/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    const book = response.data;
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).send('Book not found');
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author
  let booksAuthor = []
  for (let key in books){
    if (books[key].author.toLowerCase() === author.toLocaleLowerCase()){
      booksAuthor.push(books[key])
    }
  }

  if(booksAuthor.length > 0){
    return res.status(200).json(booksAuthor);
  } else {
    return res.status(404).send("No books found")
  }
});

public_users.get('/author-async/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    const allBooks = response.data;
    const booksAuthor = allBooks.filter(book => book.author.toLowerCase() === author);
    if (booksAuthor.length > 0) {
      return res.status(200).json(booksAuthor);
    } else {
      return res.status(404).send("No books found");
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title.toLocaleLowerCase()
  let booksTitle = []
  for (let key in books){
    if (books[key].title.toLowerCase() === title){
      booksTitle.push(books[key])
    }
  }

  if(booksTitle.length > 0){
    return res.status(200).json(booksTitle);
  } else {
    return res.status(404).send("No books found")
  }
});

public_users.get('/title-async/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    const allBooks = response.data;
    const booksTitle = allBooks.filter(book => book.title.toLowerCase() === title);
    if (booksTitle.length > 0) {
      return res.status(200).json(booksTitle);
    } else {
      return res.status(404).send("No books found");
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  let book = null
  for (let key in books){
    if (books[key].ISBN === isbn){
      book = books[key]
      break;
    }
  }

  if(book){
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).send("Book not found")
  }
});

module.exports.general = public_users;
