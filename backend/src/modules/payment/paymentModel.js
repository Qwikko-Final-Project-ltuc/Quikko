const pool = require("../../config/db");

/**
 * @module PaymentModel
 * @desc Handles all database operations for payments, including creation, update, and retrieval.
 */

/**
 * @function createPayment
 * @desc Inserts a new payment record into the database.
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.orderId - ID of the related order
 * @param {string} paymentData.paymentMethod - Method of payment (e.g., "paypal", "credit_card")
 * @param {number} paymentData.amount - Amount paid
 * @param {string} [paymentData.status="pending"] - Payment status (default: "pending")
 * @param {string} paymentData.transactionId - Unique transaction identifier
 * @returns {Promise<Object>} Payment object inserted in the database
 *
 * @example
 * const payment = await createPayment({
 *   orderId: 1,
 *   paymentMethod: "paypal",
 *   amount: 50.00,
 *   transactionId: "TX12345"
 * });
 */
exports.createPayment = async function({ orderId, paymentMethod, amount, status = "pending", transactionId }) {
  const query = `
    INSERT INTO payments (order_id, payment_method, amount, status, transaction_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [orderId, paymentMethod, amount, status, transactionId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * @function updatePaymentStatus
 * @desc Updates the status of a payment using its transaction ID.
 * @param {string} transactionId - Unique identifier of the transaction
 * @param {string} status - New status of the payment (e.g., "completed", "failed")
 * @returns {Promise<Object>} Updated payment object
 *
 * @example
 * const updated = await updatePaymentStatus("TX12345", "completed");
 */
exports. updatePaymentStatus= async function(transactionId, status) {
  const query = `
    UPDATE payments
    SET status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [transactionId, status]);
  return result.rows[0];
}

/**
 * @function getPaymentByTransactionId
 * @desc Retrieves a single payment record using its transaction ID.
 * @param {string} transactionId - Unique transaction identifier
 * @returns {Promise<Object|null>} Payment object or null if not found
 *
 * @example
 * const payment = await getPaymentByTransactionId("TX12345");
 */
exports.getPaymentByTransactionId = async function(transactionId) {
  const query = `SELECT * FROM payments WHERE transaction_id = $1`;
  const result = await pool.query(query, [transactionId]);
  return result.rows[0];
}

/**
 * @function getPaymentsByOrder
 * @desc Retrieves all payments associated with a specific order.
 * @param {number} orderId - ID of the order
 * @returns {Promise<Array<Object>>} Array of payment objects sorted by creation date (DESC)
 *
 * @example
 * const payments = await getPaymentsByOrder(1);
 */
exports.getPaymentsByOrder = async function(orderId) {
  const query = `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [orderId]);
  return result.rows;
}


exports.createPayment = async function(paymentData) {
  const {
    order_id,
    user_id,
    payment_method,
    amount,
    status,
    transaction_id,
    card_last4,
    card_brand,
    expiry_month,
    expiry_year,
  } = paymentData;

  const result = await db.query(
    `INSERT INTO payments
      (order_id, user_id, payment_method, amount, status, transaction_id, card_last4, card_brand, expiry_month, expiry_year)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
    [
      order_id,
      user_id,
      payment_method,
      amount,
      status,
      transaction_id,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
    ]
  );

  return result.rows[0];
};



