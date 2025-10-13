const paypal = require("paypal-rest-sdk");

/**
 * @module PayPalConfig
 * @desc Configures the PayPal SDK for the application.
 * 
 * @example
 * const paypal = require("../config/paypal");
 * // You can now use paypal.payment.create, paypal.payment.execute, etc.
 */

paypal.configure({
  /**
   * @property {string} mode - PayPal environment mode. Either 'sandbox' for testing or 'live' for production.
   * Defaults to 'sandbox' if process.env.PAYPAL_MODE is not set.
   */
  mode: process.env.PAYPAL_MODE || "sandbox",

  /**
   * @property {string} client_id - Your PayPal REST API client ID. Must be set in environment variables.
   */
  client_id: process.env.PAYPAL_CLIENT_ID,

  /**
   * @property {string} client_secret - Your PayPal REST API client secret. Must be set in environment variables.
   */
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
