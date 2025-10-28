const pool = require('../../config/db');

async function logInteraction(userId, productId, type, value = 1.0) {
  await pool.query(
    `INSERT INTO user_interactions (user_id, product_id, interaction_type, interaction_value)
     VALUES ($1, $2, $3, $4)`,
    [userId, productId, type, value]
  );
}

module.exports = { logInteraction };
