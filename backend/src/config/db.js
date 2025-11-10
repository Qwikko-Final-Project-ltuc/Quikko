const { Pool } = require('pg');

const pool = new Pool({
  user: 'qwikkodb_user',
  host: 'dpg-d31g920dl3ps73eqodcg-a.oregon-postgres.render.com',
  database: 'qwikkodb',
  password: 'o5eY7dm9BJd8T0rXh8xkhEwl2V2QdOxf',
  port: 5432,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  maxUses: 7500,
});

pool.on('error', (err, client) => {
  console.error('⚠️ Unexpected Postgres client error:', err.message);
  if (client) {
    try { client.release(); } catch {}
  }
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('🚨 Unhandled Rejection:', reason);
});



module.exports = pool;
