const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

categorySchema.index({ name: 1, shopkeeper: 1 }, { unique: true });


module.exports = mongoose.model("Category", categorySchema);
