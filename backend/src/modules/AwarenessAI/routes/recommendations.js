const express = require('express');
const pool = require('../../../config/db');
const { cosine } = require('../cosine');
const { updateUserEmbedding } = require('../updateUserEmbedding');
const { protect } = require('../../../middleware/authMiddleware'); 

const router = express.Router();

async function getRecommendations(userId, topN = 5) {
  await updateUserEmbedding(userId);

  const { rows: userRow } = await pool.query(
  `SELECT vector_embedding FROM users WHERE id = $1`,
    [userId]
  );

  if (!userRow.length || !userRow[0].vector_embedding) return [];
  let userEmbedding;
  try {
    userEmbedding = userRow[0].vector_embedding;
  } catch (err) {
    console.error('Failed to parse user embedding:', err);
    return [];
  }

  const { rows: allProducts } = await pool.query(
    `SELECT id, name, category_id, vector_embedding
     FROM products
     WHERE is_deleted = false AND vector_embedding IS NOT NULL`
  );

  const scored = allProducts.map(p => {
    if (!p.vector_embedding || !Array.isArray(p.vector_embedding)) return null;
    const cleanVec = p.vector_embedding.filter(v => Number.isFinite(v));
    if (!cleanVec.length) return null;

    return {
      id: p.id,
      name: p.name,
      category_id: p.category_id,
      score: cosine(userEmbedding, cleanVec)
    };
  }).filter(Boolean);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

// API endpoint
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "User not authenticated" });

    const recommendations = await getRecommendations(userId);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
