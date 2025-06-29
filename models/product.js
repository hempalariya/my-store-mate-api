const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    mrp: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    expiryDate: { type: Date },
    listedForResale: { type: Boolean, default: false },
    resaleQuantity: { type: Number, default: 0 },
    resalePrice: { type: Number },
    isNearExpiry: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    listedForDiscount: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    outOfStock: { type: Boolean, default: false },
    // NEW FIELD: To store interested shopkeepers and their contact info
    interestedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        shopName: String,
        ownerName: String,
        mobile: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);