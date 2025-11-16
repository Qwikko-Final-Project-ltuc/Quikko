const paypal = require("../../infrastructure/payment/paypal");

/**
 * @module PayPalService
 * @desc Service for creating and executing payments using PayPal API.
 */

/**
 * Create a PayPal payment.
 *
 * @async
 * @function createPayment
 * @param {number} amount - The amount to be paid in USD.
 * @returns {Promise<Object>} Returns a promise that resolves with an object containing:
 *   - {string} id - The PayPal payment ID.
 *   - {string} forwardLink - The URL where the user should be redirected to approve the payment.
 *
 * @throws {Error} Throws an error if PayPal API call fails.
 *
 * @example
 * const { id, forwardLink } = await createPayment(50.00);
 * console.log(id, forwardLink);
 */
exports.createPayment = async (amount) => {
  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: "https://qwikko.onrender.com/api/payment/success",
      cancel_url: "https://qwikko.onrender.com/api/payment/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Test Product",
              sku: "001",
              price: amount.toFixed(2),
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: amount.toFixed(2),
        },
        description: "Payment for test product",
      },
    ],
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) reject(error);
      else {
        const approvalUrl = payment.links.find((link) => link.rel === "approval_url");
        resolve({ id: payment.id, forwardLink: approvalUrl.href });
      }
    });
  });
};

/**
 * Execute a PayPal payment after the payer approves it.
 *
 * @async
 * @function executePayment
 * @param {string} paymentId - The PayPal payment ID.
 * @param {string} payerId - The PayPal Payer ID.
 * @param {number} amount - The amount to execute in USD.
 * @returns {Promise<Object>} Returns a promise that resolves with the executed payment object from PayPal.
 *
 * @throws {Error} Throws an error if PayPal API call fails.
 *
 * @example
 * const payment = await executePayment("PAY-12345", "PAYER-67890", 50.00);
 * console.log(payment);
 */
exports.executePayment = async (paymentId, payerId, amount) => {
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: amount.toFixed(2),
        },
      },
    ],
  };

  return new Promise((resolve, reject) => {
    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      if (error) reject(error);
      else resolve(payment);
    });
  });
};
