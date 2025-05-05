const User = require("../models/user");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

//create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: error.message }); 
  }
};

//get a single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "no such user" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "no such user" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//add a new user
 const createUser = async (req, res) => {
  const { shopName, ownerName, email, mobile, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "email already registered" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      shopName,
      ownerName,
      email,
      mobile,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      mobile: user.mobile,
      token,
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

//delete a user
const deleteUser = (req, res) => {
  res.send("user deleted successfully");
};

//update a user
const updateUser = (req, res) => {
  res.send("user updated successfully");
};

const loginUser = async (req, res) => {
  const {email, password} = req.body
  try{
    const user = await User.findOne({email})
    if(!user) return res.status(404).json({error: "no such user found"})

    const match = await bcryptjs.compare(password, user.password)
    if(!match) return res.status(400).json({error:"Invalid password"})

    const token = createToken(user._id)
    res.status(200).json({
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      mobile: user.mobile,
      token,
    })
  }catch(error){
    res.status(500).json({error: error.message})
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser
};
