# my-store-mate-api
 Features

    Product management (Add, List, Resale, Discount, Expiry tracking)

    Sale recording (Salewise and Productwise stats)

    Profit/Loss summary (last 30 days)

    User authentication with JWT

    Secure and protected APIs

 Tech Stack

    Node.js + Express.js

    MongoDB + Mongoose

    JWT Authentication

    dotenv, bcryptjs, cors
## Main API Endpoints

    POST /api/users/register — Register

    POST /api/users/login — Login

    GET /api/products — Fetch Products

    POST /api/products — Add Product

    PATCH /api/products/resale/:id — List for Resale

    PATCH /api/products/discount/:id — List for Discount

    GET /api/products/sale — Salewise Stats

    GET /api/products/sale/productwise — Productwise Stats

    GET /api/products/sale/summary — Profit/Loss Summary
