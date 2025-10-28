const express = require('express');
const pool = require('../../config/db');

const router = express.Router();

router.get('/top-categories', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.name AS category, SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    GROUP BY c.name
    ORDER BY total_sold DESC
    LIMIT 5;
  `);
  res.json(rows);
});

router.get('/top-customers', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.name, SUM(oi.quantity * oi.price) AS total_spent
    FROM users u
    JOIN orders o ON o.customer_id = u.id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE u.role = 'customer'
    GROUP BY u.name
    ORDER BY total_spent DESC
    LIMIT 5;
  `);
  res.json(rows);
});

module.exports = router;
