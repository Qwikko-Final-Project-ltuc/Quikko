const pool = require('../config/db');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { admin } = require('../infrastructure/firebase'); 
const axios = require('axios');

// دالة مساعدة لإنشاء slugs صديقة للروابط
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// خريطة لتوزيع categories API على DB
const categoryMap = {
  'smartphones': 'Electronics',
  'laptops': 'Electronics',
  'fragrances': 'Beauty',
  'skincare': 'Health',
  'groceries': 'Home & Kitchen',
  'home-decoration': 'Home & Kitchen',
  'furniture': 'Home & Kitchen',
  'tops': 'Fashion',
  'womens-dresses': 'Fashion',
  'womens-shoes': 'Fashion',
  'mens-shirts': 'Fashion',
  'mens-shoes': 'Fashion',
  'mens-watches': 'Fashion',
  'womens-watches': 'Fashion',
  'womens-bags': 'Fashion',
  'sunglasses': 'Fashion',
  'automotive': 'Sports',
  'motorcycle': 'Sports',
  'lighting': 'Home & Kitchen',
  'skincare': 'Health',
  'tools': 'Home & Kitchen',
  'books': 'Books',
  'toys': 'Toys'
};

async function seed() {
  try {
    console.log(" Starting seed process...");

    // حذف البيانات القديمة بدون حذف users/vendors
    await pool.query(`DELETE FROM product_reviews`);
    await pool.query(`DELETE FROM stars_review`);
    await pool.query(`DELETE FROM wishlist`);
    await pool.query(`DELETE FROM cart_items`);
    await pool.query(`DELETE FROM carts`);
    await pool.query(`DELETE FROM order_items`);
    await pool.query(`DELETE FROM orders`);
    await pool.query(`DELETE FROM product_images`);
    await pool.query(`DELETE FROM products`);
    await pool.query(`DELETE FROM categories`);

    // Categories
    const categories = ['Beauty','Electronics','Home & Kitchen','Fashion','Health','Sports','Toys','Books'];
    const categoryIds = {};
    for (const name of categories) {
      const res = await pool.query(
        `INSERT INTO categories(name) VALUES($1) RETURNING id`,
        [name]
      );
      categoryIds[name] = res.rows[0].id;
    }
    console.log(` ${categories.length} categories inserted.`);

    const newCustomers = [];
    for (let i = 0; i < 10; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const password = 'password123';

      // Firebase User
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          userRecord = await admin.auth().getUserByEmail(email);
          console.log(` User with email ${email} already exists.`);
        } else {
          throw err;
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const existing = await pool.query(`SELECT id FROM users WHERE firebase_uid=$1`, [userRecord.uid]);
      let userId;
      if (existing.rows.length) {
        userId = existing.rows[0].id;
      } else {
        const res = await pool.query(
          `INSERT INTO users(name,email,password_hash,role,firebase_uid) VALUES($1,$2,$3,$4,$5) RETURNING id`,
          [name,email,hashedPassword,'customer',userRecord.uid]
        );
        userId = res.rows[0].id;
      }

      const dob = faker.date.birthdate({ min: 18, max: 60, mode: 'age' });
      const gender = faker.person.sexType();
      const existingCustomer = await pool.query(`SELECT user_id FROM customers WHERE user_id=$1`, [userId]);
      if (!existingCustomer.rows.length) {
        await pool.query(
          `INSERT INTO customers(user_id,date_of_birth,gender) VALUES($1,$2,$3)`,
          [userId, dob, gender]
        );
      }

      newCustomers.push(userId);
    }
    console.log(` ${newCustomers.length} new customers added.`);


    const vendorsRes = await pool.query(`SELECT id FROM vendors`);
    const vendorIds = vendorsRes.rows.map(v => v.id);

    // Products من DummyJSON API
    console.log(" Fetching products from DummyJSON API...");
    const apiRes = await axios.get('https://dummyjson.com/products?limit=100');
    const products = apiRes.data.products;

    const productIds = [];

    for (const p of products) {
      const dbCategory = categoryMap[p.category] || 'Electronics';
      const categoryId = categoryIds[dbCategory];

      const vendorId = faker.helpers.arrayElement(vendorIds);

      const resProduct = await pool.query(
        `INSERT INTO products(vendor_id,name,description,price,stock_quantity,category_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
        [vendorId, p.title, p.description, p.price, p.stock, categoryId]
      );
      const productId = resProduct.rows[0].id;
      productIds.push(productId);

      for (const imgUrl of p.images) {
        await pool.query(
          `INSERT INTO product_images(product_id,image_url) VALUES($1,$2)`,
          [productId, imgUrl]
        );
      }
    }

    console.log(` ${productIds.length} products + images inserted.`);

    console.log(" Seed completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error(" Seed failed:", err);
    process.exit(1);
  }
}

seed();
