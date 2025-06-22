const Category = require("../models/category");


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({name, shopkeeper: req.user._id})
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
    try{
    const categories = await Category.find({shopkeeper: req.user._id})
    res.status(200).json(categories)
    }catch(error){
        res.status(500).json({error: error.message})
    }
};

module.exports = {
  createCategory,
  getCategories,
};
