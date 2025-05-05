const Product = require("../models/product");
const SoldProduct = require("../models/SoldProduct");

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffInDays = (expiry - today) / (1000 * 60 * 60 * 24);
  return {
    isNearExpiry: diffInDays <= 30 && diffInDays >= 0,
    isExpired: diffInDays < 0,
  };
};

const addProduct = async (req, res) => {
  const { name, category, mrp, costPrice, quantity, expiryDate, discount } =
    req.body;

  const { isNearExpiry, isExpired } = getExpiryStatus(expiryDate);
  try {
    const existingProduct = await Product.findOne({
      shopkeeper: req.user.id,
      name,
      mrp,
      costPrice,
      expiryDate,
    });

    if (existingProduct) {
      existingProduct.quantity += Number(quantity);
      existingProduct.isNearExpiry = isNearExpiry;
      existingProduct.isExpired = isExpired;
      existingProduct.outOfStock = false;
      await existingProduct.save();
      return res
        .status(200)
        .json({ message: "quantity updated", product: existingProduct });
    }

    const product = await Product.create({
      shopkeeper: req.user.id,
      name,
      category,
      mrp,
      costPrice,
      quantity,
      expiryDate,
      discount,
      isNearExpiry,
      isExpired,
      outOfStock: quantity === 0,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ shopkeeper: req.user.id });

    //update each product's isNearExpiry Field if needed
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const { isNearExpiry, isExpired } = getExpiryStatus(product.expiryDate);

        if (
          product.isNearExpiry !== isNearExpiry ||
          product.isExpired !== isExpired
        ) {
          product.isNearExpiry = isNearExpiry;
          product.isExpired = isExpired;
          await product.save();
        }
        if (product.quantity === 0 && !product.outOfStock) {
          product.outOfStock = true;
          await product.save();
        } else if (product.quantity > 0 && product.outOfStock) {
          product.outOfStock = false;
          await product.save();
        }

        return product;
      })
    );

    res.status(200).json(updatedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listForResale = async (req, res) => {
  const { productId } = req.params;
  const { resaleQuantity, resalePrice } = req.body;

  try {
    const product = await Product.findOne({
      _id: productId,
      shopkeeper: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    if (resaleQuantity > product.quantity) {
      return res
        .status(400)
        .json({ error: "Resale quantity exceeds available stock" });
    }

    product.listedForResale = true;
    product.resaleQuantity = resaleQuantity;
    product.resalePrice = resalePrice;

    await product.save();
    res.status(200).json({ message: "Product listed for resale", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllResaleProducts = async (req, res) => {
  try {
    const resaleProducts = await Product.find({
      listedForResale: true,
      shopkeeper: req.user.id,
    }).populate("shopkeeper");
    res.status(200).json(resaleProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllNearExpiryProducts = async (req, res) => {
  try {
    const nearExpiryProducts = await Product.find({
      isNearExpiry: true,
      shopkeeper: req.user.id,
    }).populate("shopkeeper");
    res.status(200).json(nearExpiryProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listForDiscount = async (req, res) => {
  const { productId } = req.params;
  const { discountPercent } = req.body;
  try {
    const product = await Product.findOne({
      _id: productId,
      shopkeeper: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    product.listedForDiscount = true;
    product.discount = discountPercent;
    await product.save();
    res.status(200).json({ message: "Product listed for discount" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDiscountedProducts = async (req, res) => {
  try {
    const discountProducts = await Product.find({
      listedForDiscount: true,
      shopkeeper: req.user.id,
    }).populate("shopkeeper");
    res.status(200).json(discountProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDiscountedProductList = async (req, res) => {
  try {
    const products = await Product.find({ listedForDiscount: true })
      .select("name discount mrp shopkeeper")
      .populate("shopkeeper", "shopName");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExpiredProducts = async (req, res) => {
  try {
    const expiredProducts = await Product.find({
      isExpired: true,
      shopkeeper: req.user.id,
    });
    res.status(200).json(expiredProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNearbyResaleProducts = async (req, res) => {
  try {
    const products = await Product.find({
      listedForResale: true,
      shopkeeper: { $ne: req.user.id },
    }).populate("shopkeeper", "mobile shopName");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**********sold itmes **************/
//add sold items
const addSoldProducts = async (req, res) => {
  const { name, mrp, costPrice, quantity } = req.body;
  try {
    const product = await Product.findOne({
      shopkeeper: req.user.id,
      name,
      mrp,
      costPrice,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found for sale" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.outOfStock = true;
    }

    await product.save();

    const sold = await SoldProduct.create({
      shopkeeper: req.user.id,
      name,
      mrp,
      costPrice,
      quantity,
    });

    res.status(201).json({ message: "Sale recorded", sold });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all the sold items

//get sale summary
const saleSummary = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0); // start of day

  try {
    const sales = await SoldProduct.find({
      shopkeeper: req.user.id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (sales.length === 0) {
      return res.status(400).json({ error: "No record found." });
    }

    let totalSale = 0;
    let totalPurchase = 0;

    for (const sale of sales) {
      totalSale += Number(sale.mrp) * Number(sale.quantity);
      totalPurchase += Number(sale.costPrice) * Number(sale.quantity);
    }

    const profitOrLoss = totalSale - totalPurchase;

    res.status(200).json({
      totalSale,
      totalPurchase,
      profitOrLoss,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//salewise stats
const getSalewiseStats = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const sales = await SoldProduct.find({
      shopkeeper: req.user.id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//productwise stats

const getProductWiseStats = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0); // normalize to start of day

  try {
    const sales = await SoldProduct.find({
      shopkeeper: req.user.id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (sales.length === 0) {
      return res.status(200).json([]); // return empty if no recent sales
    }

    const groupedStats = {};

    sales.forEach((sale) => {
      const key = `${sale.name}-${sale.mrp}-${sale.costPrice}`;
      if (!groupedStats[key]) {
        groupedStats[key] = {
          name: sale.name,
          mrp: sale.mrp,
          costPrice: sale.costPrice,
          totalQuantity: 0,
          totalSale: 0,
          totalPurchase: 0,
        };
      }

      groupedStats[key].totalQuantity += sale.quantity;
      groupedStats[key].totalSale += sale.mrp * sale.quantity;
      groupedStats[key].totalPurchase += sale.costPrice * sale.quantity;
    });

    const result = Object.values(groupedStats).map((item) => ({
      name: item.name,
      mrp: item.mrp,
      costPrice: item.costPrice,
      totalQuantity: item.totalQuantity,
      totalSale: item.totalSale,
      totalPurchase: item.totalPurchase,
      profitOrLoss: item.totalSale - item.totalPurchase,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in productwise stats:", error.message);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addProduct,
  getUserProducts,
  listForResale,
  getAllResaleProducts,
  getAllNearExpiryProducts,
  listForDiscount,
  getAllDiscountedProducts,
  getAllExpiredProducts,
  getDiscountedProductList,
  getNearbyResaleProducts,
  addSoldProducts,
  saleSummary,
  getSalewiseStats,
  getProductWiseStats,
};
