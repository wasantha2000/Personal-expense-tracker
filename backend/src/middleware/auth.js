import jwt from "jsonwebtoken";

/**
 * Middleware to protect routes.
 * Reads the JWT from the HttpOnly 'token' cookie,
 * verifies it and attaches req.user = { id, name, email }.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}
