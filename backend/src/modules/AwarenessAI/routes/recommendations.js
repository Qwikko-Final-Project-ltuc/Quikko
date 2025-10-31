// routes/recommendations.js
const express = require('express');
const pool = require('../../../config/db');
const { cosine } = require('../cosine');
const { updateUserEmbedding } = require('../updateUserEmbedding');
const { protect } = require('../../../middleware/authMiddleware'); 

const router = express.Router();

/**
 * Fetch product recommendations for a user
 * @param {number} userId
 * @param {Array} excludeIds - product IDs to exclude
 * @returns {Array} recommended products
 */
async function getRecommendations(userId, excludeIds = []) {
  await updateUserEmbedding(userId);

  const { rows: userRow } = await pool.query(
    `SELECT vector_embedding FROM users WHERE id = $1`,
    [userId]
  );

  // 🔹 fallback logic إذا ما في embedding
  if (!userRow.length || !userRow[0].vector_embedding) {
    console.log("No user embedding found — returning fallback recommendations.");

    const { rows: fallback } = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category_id,
        p.price,
        p.description,
        COALESCE(
          json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id) AS rating_count
      FROM products p
      LEFT JOIN product_reviews r ON r.product_id = p.id AND r.is_deleted = false
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.is_deleted = false
      GROUP BY p.id
      HAVING COUNT(r.id) > 0
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);

    return fallback;
  }

  let userEmbedding;
  try {
    userEmbedding = userRow[0].vector_embedding;
  } catch (err) {
    console.error('Failed to parse user embedding:', err);
    return [];
  }

  const { rows: allProducts } = await pool.query(`
    SELECT 
      p.id, p.name, p.category_id, p.price, p.description, p.vector_embedding,
      COALESCE(
        json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE p.is_deleted = false AND p.vector_embedding IS NOT NULL
    GROUP BY p.id
  `);

  const scored = allProducts
    .filter(p => p.vector_embedding && Array.isArray(p.vector_embedding))
    .map(p => {
      const cleanVec = p.vector_embedding.filter(v => Number.isFinite(v));
      if (!cleanVec.length) return null;
      return { ...p, score: cosine(userEmbedding, cleanVec) };
    })
    .filter(Boolean)
    .filter(p => !excludeIds.includes(p.id));

  scored.sort((a, b) => b.score - a.score);

  return scored;
}


// API endpoint
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const excludeIds = req.query.excludeIds ? JSON.parse(req.query.excludeIds) : [];

    if (!userId) return res.status(400).json({ error: "User not authenticated" });

    const recommendations = await getRecommendations(userId, excludeIds);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
