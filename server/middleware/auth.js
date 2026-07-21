import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "streamvault_secret_key_123";

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing or invalid" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is expired or invalid" });
    }
    req.user = user;
    next();
  });
}
