const express = require('express');
const { logInteraction } = require('../logInteraction');
const { updateUserEmbedding } = require('../updateUserEmbedding');

const router = express.Router();

const INTERACTION_WEIGHTS = {
  view: 1,
  like: 2,
  unlike: -2,
  add_to_cart: 3.5,
  purchase: 5,
  remove_from_cart: -3.5,
};

router.post('/', async (req, res) => {
  const { userId, productId, type } = req.body;

  if (!userId || !productId || !type)
    return res.status(400).json({ error: 'Missing fields' });

  const value = INTERACTION_WEIGHTS[type] || 1;

  try {
    await logInteraction(userId, productId, type, value);

    // تحديث الـ embedding فقط للتفاعلات القوية
    if (Math.abs(value) >= 3) {
      await updateUserEmbedding(userId);
      console.log(`Updated user ${userId} embedding after strong interaction: ${type}`);
    } else {
      console.log(`Logged weak interaction (${type}), skipping embedding update`);
    }

    res.json({ 
        message: 'Interaction logged', 
        type, 
        value, 
        embeddingUpdated: Math.abs(value) >= 3 
        });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
