/**
 * ===============================
 * MAIN SERVER ENTRY POINT
 * ===============================
 * @file server.js
 * @description
 * This file initializes and configures the Express server for the application.
 * It handles:
 *  - Loading environment variables
 *  - Setting up middleware (JSON parsing, Swagger documentation)
 *  - Connecting to the PostgreSQL database
 *  - Defining and mounting all API routes
 *  - Starting the server listener
 *
 * @module Server
 */

// Load environment variables from .env file
require("dotenv").config();

// Import core dependencies
const express = require("express");
const pool = require("./src/config/db"); // PostgreSQL connection pool
const app = express();
const cookieParser = require("cookie-parser");
const identifyCustomer = require("./src/middleware/identifyCustomer");
const guestToken = require("./src/middleware/guestToken");


// ===============================
// CORS Configuration (Optional)
// ===============================
// Uncomment and configure if frontend runs on a different origin
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  credentials: true ,
  allowedHeaders: ['Content-Type', 'Authorization','Guest-Token'],
  exposedHeaders: ['Guest-Token']
}));


// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(cookieParser());

app.get("/set-cookie", (req, res) => {
  res.cookie("Cookie_1", "value", {
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24, 
    path: "/",
  });
  res.send("Cookie is set!");
});

app.get("/get-cookie", (req, res) => {
  console.log("Cookies:", req.cookies); 
  res.json(req.cookies);
});
// ===============================
// Swagger API Documentation Setup
// ===============================
const { swaggerUi, specs } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


// DATABASE CONNECTION TEST
// ===============================
pool
  .connect()
  .then(() => console.log("Connected to Render DB!"))
  .catch((err) => console.error("Connection error", err.stack));

// ===============================
// ROUTES
// ===============================
// Category Routes
const categoryRoutes = require("./src/modules/category/categoryRoutes");
app.use("/api/categories", categoryRoutes);

// Vendor Routes
const vendorRoutes = require("./src/modules/vendor/vendorRoutes");
app.use("/api/vendor", vendorRoutes);

// Delivery Routes
const deliveryRoutes = require("./src/modules/delivery/deliveryRoutes");
app.use("/api/delivery", deliveryRoutes);

// Auth Routes
const authRoutes = require("./src/modules/auth/authRoutes");
app.use("/api/auth", authRoutes);

// Admin Routes
const adminRoutes = require("./src/modules/admin/adminRoutes");
app.use("/api/admin", adminRoutes);

// Payment Routes
const paymentRoutes = require("./src/modules/payment/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Notifications Routes
const notificationRoutes = require("./src/infrastructure/notification/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// User Routes
const userRoutes = require("./src/modules/user/userRoutes");
app.use("/api/users", userRoutes);

// CMS Routes
const cmsRoutes = require("./src/modules/cms/cmsRoutes");
app.use("/api/cms", cmsRoutes);

// Customer Routes
const customerRoutes = require("./src/modules/customer/customerRoutes");
app.use("/api/customers", customerRoutes);

// Chat Routes
const chatRoutes = require("./src/modules/chat/chatRoutes");
app.use("/api/chat", chatRoutes);

// Product Routes
const productsRoutes = require("./src/modules/product/productRoutes");
app.use("/api/products", productsRoutes);

// Review Routes
const reviewRoutes = require("./src/modules/review/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

// ===============================
// SERVER LISTENER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
