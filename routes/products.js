const express = require('express');
const {addProduct, getUserProducts, listForResale, getAllResaleProducts, getAllNearExpiryProducts, listForDiscount, getAllDiscountedProducts, getDiscountedProductList, getAllExpiredProducts, getNearbyResaleProducts, addSoldProducts, saleSummary, getSalewiseStats, getProductWiseStats} = require('../controllers/productController')
const protect = require('../middleware/auth')

const router = express.Router();

//add new product
router.post('/', protect, addProduct)

//get all products of logged in user 
router.get('/', protect, getUserProducts)

//add resale items
router.patch("/resale/:productId", protect, listForResale)

//get all the resale items
router.get('/resale', protect, getAllResaleProducts)

//get all near expiry items
router.get('/near-expiry', protect,  getAllNearExpiryProducts)

//add discount
router.patch("/discount/:productId", protect, listForDiscount)

//get all discounted items
router.get("/discount", protect, getAllDiscountedProducts) 

//get all expired items
router.get("/expired", protect, getAllExpiredProducts)

//get all discounted items for index page
router.get("/discount/list", getDiscountedProductList)

//get all the products nearby listed for resale

router.get("/resale/nearby", protect, getNearbyResaleProducts)


/***************sold product routes*********************/

//add a sold product
router.post('/sold', protect, addSoldProducts)

//get all sold products

router.get('/sale', protect, getSalewiseStats)

//get productwise sale
router.get('/sale/productwise', protect, getProductWiseStats)

//get saleSummary

router.get('/sale/summary', protect, saleSummary)


module.exports = router

  