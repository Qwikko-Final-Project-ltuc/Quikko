const { Pool } = require('pg');

const pool = new Pool({
  user: 'qwikkodb_user',
  host: 'dpg-d31g920dl3ps73eqodcg-a.oregon-postgres.render.com',
  database: 'qwikkodb',
  password: 'o5eY7dm9BJd8T0rXh8xkhEwl2V2QdOxf',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },

  max: 20,                    // أقصى عدد اتصالات
  idleTimeoutMillis: 30000,   // 30 ثانية
  connectionTimeoutMillis: 5000, // انتظار 5 ثواني للاتصال
  maxUses: 7500,              // إعادة الاتصال بعد 7500 استخدام
});

module.exports = pool;

