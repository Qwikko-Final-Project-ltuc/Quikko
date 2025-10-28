const pool = require('../config/db');
const { faker } = require('@faker-js/faker');
const axios = require('axios');

async function seedMoreProducts() {
  try {
    console.log(" Starting seed for target categories...");

    const targetCategories = ['Health', 'Sports', 'Toys', 'Books'];
    const { rows: categories } = await pool.query(
      `SELECT id, name FROM categories WHERE name = ANY($1)`,
      [targetCategories]
    );
    if (!categories.length) throw new Error('No target categories found');

    // const categoryIds = categories.map(c => c.id);
    // await pool.query(`DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id = ANY($1))`, [categoryIds]);
    // await pool.query(`DELETE FROM products WHERE category_id = ANY($1)`, [categoryIds]);
    // console.log(" Old products deleted for target categories");

    const { rows: vendors } = await pool.query(`SELECT id FROM vendors`);
    if (!vendors.length) throw new Error('No vendors found');
    const { rows: customers } = await pool.query(`SELECT id FROM users WHERE role='customer'`);
    if (!customers.length) throw new Error('No customers found');

    const numProductsPerCategory = 40; 
    const productIds = [];

    for (const category of categories) {
      console.log(` Generating products for category: ${category.name}...`);

      const products = [];
      for (let i = 0; i < numProductsPerCategory; i++) {
        products.push({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(10, 500, 2),
          stock: faker.number.int({ min: 0, max: 100 }),
          images: [`https://source.unsplash.com/600x600/?${category.name.toLowerCase()}`]
        });
      }

      for (const p of products) {
        const vendor = faker.helpers.arrayElement(vendors);
        const resProduct = await pool.query(
          `INSERT INTO products(vendor_id,name,description,price,stock_quantity,category_id)
           VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
          [vendor.id, p.title, p.description, p.price, p.stock, category.id]
        );
        const productId = resProduct.rows[0].id;
        productIds.push(productId);

        for (const img of p.images) {
          await pool.query(
            `INSERT INTO product_images(product_id,image_url) VALUES($1,$2)`,
            [productId, img]
          );
        }
      }

      console.log(` ${products.length} products added for ${category.name}`);
    }

    console.log(" Adding carts, orders, wishlist, and reviews...");

    for (const customer of customers) {
      const cartProducts = faker.helpers.arrayElements(productIds, faker.number.int({ min: 1, max: 3 }));
      if (cartProducts.length) {
        const resCart = await pool.query(
          `INSERT INTO carts(user_id,created_at) VALUES($1,NOW()) RETURNING id`,
          [customer.id]
        );
        const cartId = resCart.rows[0].id;
        for (const productId of cartProducts) {
          await pool.query(
            `INSERT INTO cart_items(cart_id,product_id,quantity) VALUES($1,$2,$3)`,
            [cartId, productId, faker.number.int({ min: 1, max: 5 })]
          );
        }
      }

      const wishlistProducts = faker.helpers.arrayElements(productIds, faker.number.int({ min: 1, max: 3 }));
      for (const productId of wishlistProducts) {
        await pool.query(`INSERT INTO wishlist(user_id,product_id) VALUES($1,$2)`, [customer.id, productId]);
      }

      // Orders: 1-2
      const orderProducts = faker.helpers.arrayElements(productIds, faker.number.int({ min: 1, max: 2 }));
      if (orderProducts.length) {
        const resOrder = await pool.query(
          `INSERT INTO orders(customer_id,created_at,total_amount,status,payment_status)
           VALUES($1,NOW(),$2,'pending','pending') RETURNING id`,
          [customer.id, faker.commerce.price(50, 500, 2)]
        );
        const orderId = resOrder.rows[0].id;
        for (const productId of orderProducts) {
          await pool.query(
            `INSERT INTO order_items(order_id,product_id,quantity,price)
             VALUES($1,$2,$3,$4)`,
            [orderId, productId, faker.number.int({ min: 1, max: 5 }), faker.commerce.price(10, 500, 2)]
          );
        }
      }
    }

    for (const productId of productIds) {
      const numReviews = faker.number.int({ min: 0, max: 5 });
      const reviewCustomers = faker.helpers.arrayElements(customers, numReviews);
      for (const customer of reviewCustomers) {
        await pool.query(
          `INSERT INTO product_reviews(user_id,product_id,rating,comment,created_at)
           VALUES($1,$2,$3,$4,NOW())`,
          [customer.id, productId, faker.number.int({ min: 1, max: 5 }), faker.lorem.sentence()]
        );
      }
    }

    console.log(` Seed completed successfully!`);
    process.exit(0);

  } catch (err) {
    console.error(" Seed failed:", err);
    process.exit(1);
  }
}

seedMoreProducts();
