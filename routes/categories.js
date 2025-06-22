const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");
const protect  = require("../middleware/auth.js");

const router = express.Router();

router.post("/", protect, createCategory);
router.get("/", protect, getCategories);

module.exports = router;
