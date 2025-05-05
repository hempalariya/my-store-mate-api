require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes); 
app.use("/api/products", productRoutes); 

const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log("listening on port " + PORT));
});
 