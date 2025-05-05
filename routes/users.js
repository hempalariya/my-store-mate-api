const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
} = require("../controllers/userController");

const router = express.Router();

//get all the users
router.get("/", getUsers);

//get a single user
router.get("/:id", getUser);

//create a new user
router.post("/", createUser);

//delete a user
router.delete("/:id", deleteUser); 
//update a user
router.patch("/:id", updateUser);
 
//login a user
router.post("/login", loginUser);

module.exports = router;
 