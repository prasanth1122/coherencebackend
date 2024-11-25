import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
  // Check token in Authorization header
  const token =
    req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token; // Check token in cookies

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded JWT payload (user) to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
