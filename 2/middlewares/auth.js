const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Authentication failed." });

    // Extract token if it's in "Bearer <token>" format
    const bearerToken = token.split(" ")[1];
    if (!bearerToken) return res.status(401).json({ msg: "Token format is incorrect." });

    // Validate the token
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) return res.status(401).json({ msg: "Authentication failed." });
      // Attach user to the request object and proceed
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
