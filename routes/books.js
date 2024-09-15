const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render("books/index", { books, title: "SQL Library!" });
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new", { book: {}, title: "New Book" });
});

/* POST create new book */
router.post('/', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);  // Attempt to create a new book
    res.redirect('/books');  // Redirect to the books list if successful
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Render form again with validation errors
      res.render('books/new', {
        book: req.body,  // Pass the data that was entered
        errors: error.errors  // Pass the Sequelize validation errors
      });
    } else {
      next(error);  // For other types of errors, pass it to the global error handler
    }
  }
});
/* Edit book form. */
router.get("/:id/edit", asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render("books/edit", { book, title: "Edit Book" });
}));

// GET individual book by ID
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    // Book not found, forward 404 error to the global error handler
    const err = new Error("Book Not Found");
    return next(err);  // Forward error to global error handler
  }

  // If book exists, render the book details page
  res.render("books/show", { book, title: book.title });
}));

/* Update a book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect("/books/" + book.id);
}));

/* Delete book form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render("books/delete", { book, title: "Delete Book" });
}));

/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/books");
}));

module.exports = router;
