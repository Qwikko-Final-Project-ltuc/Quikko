import OpenAI from 'openai';
import dotenv from 'dotenv';
import pool from '../../config/db.js';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const BATCH_SIZE = 4; 
const WAIT_MS = 1000;  

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}


async function main() {
  try {
    const { rows: products } = await pool.query(`
      SELECT p.id, p.name, p.description, c.name AS category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_deleted = false
    `);

    console.log(`Found ${products.length} products.`);

    const productChunks = chunkArray(products, BATCH_SIZE);

    for (const chunk of productChunks) {
      for (const product of chunk) {
        const text = `${product.name} - ${product.description} - Category: ${product.category}`;

        try {
          const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
          });

          const embedding = response.data[0].embedding;

          await pool.query(
            `UPDATE products SET vector_embedding = $1 WHERE id = $2`,
            [embedding, product.id]
          );

          console.log(`Processed product ID: ${product.id} - ${product.name}`);
        } catch (err) {
          console.error(`Error generating embedding for product ID: ${product.id}`, err.message);
        }
      }

      console.log(`Processed batch of ${chunk.length} products.`);
      await sleep(WAIT_MS); 
    }

    console.log('Embeddings generated and saved successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
