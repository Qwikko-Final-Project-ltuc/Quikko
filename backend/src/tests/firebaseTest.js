const { admin } = require('../infrastructure/firebase');

async function testFirebase() {
  try {
    const user = await admin.auth().createUser({
      email: 'testuser@example.com',
      password: '123456',
    });
    console.log('Firebase User Created:', user.uid);
  } catch (err) {
    console.error('Firebase Error:', err);
  }
}

testFirebase();
