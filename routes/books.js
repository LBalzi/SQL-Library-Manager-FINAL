const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
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
router.post('/new', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);  // Sequelize automatically validates here
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Render the form again, passing the entered data and validation errors
      res.render('books/new', {
        book: req.body, 
        errors: error.errors  // This contains the friendly error messages
      });
    } else {
      next(error);
    }
  }
});


/* Edit book form. */
router.get("/:id/edit", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render("books/edit", { book, title: "Edit Book" });
}));

// GET individual book by ID
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) {
    const err = new Error("Book Not Found");
    return next(err);
  }
  res.render("books/show", { book, title: book.title });
}));

/* Update a book. */
router.post('/:id', asyncHandler(async (req, res) => {
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
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/books");
}));

module.exports = router;
