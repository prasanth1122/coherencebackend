import jwt from "jsonwebtoken";
import User from "../../backend/models/userModel.js"; // Ensure correct path

// Middleware to verify the refresh token and attach user to req.user
export const authenticateRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    const isTokenValid =
      user && (await bcrypt.compare(refreshToken, user.refreshToken));
    if (!user || !isTokenValid) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    req.user = decoded; // Attach user data for controller reuse
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
