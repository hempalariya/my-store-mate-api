const mongoose = require("mongoose");

const soldProductSchema = new mongoose.Schema({
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  mrp: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, {timestamps: true});

module.exports = mongoose.model("SoldProduct", soldProductSchema)
