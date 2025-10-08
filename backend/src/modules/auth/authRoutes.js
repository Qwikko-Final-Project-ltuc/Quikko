const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { validateRegister, validateLogin } = require('./authValidators');

/**
 * ===============================
 * Auth Routes
 * ===============================
 * @module AuthRoutes
 * @desc Routes for user, vendor, and delivery registration and login.
 *       All routes include input validation middleware for security and consistency.
 */

/**
 * @route   POST /api/auth/register/customer
 * @desc    Register a new customer
 * @access  Public
 * @body    {string} name - Full name of the customer
 * @body    {string} email - Email address
 * @body    {string} password - Password
 * @body    {string} [phone] - Optional phone number
 * @body    {string} [address] - Optional address
 * @returns {Object} Message and created customer data with JWT token
 */
router.post('/register/customer', validateRegister, authController.registerUser);

/**
 * @route   POST /api/auth/register/vendor
 * @desc    Register a new vendor
 * @access  Public
 * @body    {string} name - Vendor's name
 * @body    {string} email - Email address
 * @body    {string} password - Password
 * @body    {string} store_name - Name of the vendor's store
 * @body    {string} [phone] - Optional phone number
 * @body    {string} [description] - Optional store description
 * @returns {Object} Message and created vendor data with JWT token
 */
router.post('/register/vendor', validateRegister, authController.registerVendor);

/**
 * @route   POST /api/auth/register/delivery
 * @desc    Register a new delivery company
 * @access  Public
 * @body    {string} name - Contact person or company name
 * @body    {string} email - Email address
 * @body    {string} password - Password
 * @body    {string} company_name - Official company name
 * @body    {string} [phone] - Optional phone number
 * @returns {Object} Message and created delivery data with JWT token
 */
router.post('/register/delivery', validateRegister, authController.registerDelivery);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 * @body    {string} email - Email address
 * @body    {string} password - Password
 * @returns {Object} Login success message and JWT token
 */
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/update-password', authController.updatePassword);

module.exports = router;

/* ================= Swagger Documentation =================

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and registration endpoints
 */

/**
 * @swagger
 * /api/auth/register/customer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       description: Customer registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error or duplicate user
 */

/**
 * @swagger
 * /api/auth/register/vendor:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Auth]
 *     requestBody:
 *       description: Vendor registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - store_name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               store_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Validation error or duplicate vendor
 */

/**
 * @swagger
 * /api/auth/register/delivery:
 *   post:
 *     summary: Register a new delivery company
 *     tags: [Auth]
 *     requestBody:
 *       description: Delivery registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - company_name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery company registered successfully
 *       400:
 *         description: Validation error or duplicate record
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       description: Login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not approved (vendor/delivery)
 */
