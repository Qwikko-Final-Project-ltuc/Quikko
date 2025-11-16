module.exports = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    if (req.customerId) {
      req.isGuest = false;
    } else if (req.guestToken) {
      req.isGuest = true;
    } else {
      return res.status(500).json({ message: "  UserID and guset token not defined" });
    }
    next();
  } catch (err) {
    console.error("IdentifyCustomer middleware error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

