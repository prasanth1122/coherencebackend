import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/userModel.js";

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.error("Refresh token missing in request.");
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    const isTokenValid =
      user && (await bcrypt.compare(refreshToken, user.refreshToken));

    if (!user || !isTokenValid) {
      console.error("Invalid or expired refresh token for user:", decoded.id);
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2m" } // Token expires in 2 minutes
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 2, // 2 minutes
      sameSite: "Lax",
    });

    console.log("Token refreshed successfully for user:", decoded.id);
    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (err) {
    console.error("Error refreshing token:", err.message);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
