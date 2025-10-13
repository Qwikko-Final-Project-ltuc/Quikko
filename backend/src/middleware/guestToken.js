const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  if (req.customerId) return next();

  let token = req.cookies?.guest_token || req.headers['guest-token'];

  if (!token) {
    token = uuidv4();
    res.cookie('guest_token', token, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    // console.log("New guest token created:", token);
  } else {
    // console.log("Existing guest token:", token);
  }

  res.setHeader('Guest-Token', token);
  req.guestToken = token;

  next();
};
