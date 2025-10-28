const pool = require('../../config/db');
const { averageEmbeddings } = require('./cosine');

async function updateUserEmbedding(userId) {
  const { rows: interactions } = await pool.query(
    `SELECT product_id, interaction_value FROM user_interactions WHERE user_id = $1`,
    [userId]
  );

  if (!interactions.length) return;

  const productIds = interactions.map(i => i.product_id);

  const { rows: products } = await pool.query(
    `SELECT vector_embedding FROM products WHERE id = ANY($1)`,
    [productIds]
  );

  const embeddings = products.map((p, idx) => {
    if (!p.vector_embedding || !Array.isArray(p.vector_embedding)) return null;
    const cleanVec = p.vector_embedding.filter(v => Number.isFinite(v));
    return cleanVec.length ? cleanVec : null;
  }).filter(Boolean);

  if (!embeddings.length) return; 

  const weightedEmbeddings = embeddings.map((vec, idx) => {
    const weight = interactions[idx]?.interaction_value || 1;
    return vec.map(v => v * weight);
  });

  const avgEmbedding = averageEmbeddings(weightedEmbeddings);

  if (!avgEmbedding || !Array.isArray(avgEmbedding)) return;

  await pool.query(
    `UPDATE users SET vector_embedding = $1 WHERE id = $2`,
    [JSON.stringify(avgEmbedding), userId]
  );
}

module.exports = { updateUserEmbedding };
