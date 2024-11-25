import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";

export const logout = async (req, res) => {
  try {
    const { user } = req; // From authenticateJWT middleware

    // Clear the refresh token in the database
    await User.findByIdAndUpdate(user.id, { refreshToken: "" });

    // Clear the JWT token in the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure it's set to true in production (with HTTPS)
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging out", error: err.message });
  }
};
