import express from "express";
import { login } from "../controllers/users/login.js";
import { logout } from "../controllers/users/logoutController.js";
import { signup } from "../controllers/users/signup.js";
import { refreshToken } from "../controllers/users/refreshTokenController.js"; // Import the refresh token controller
import { authenticateRefreshToken } from "../middleware/refreshTokenAuth.js"; // Import the refresh token middleware
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/users/passwordController.js";

const router = express.Router();

// User routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Refresh token route
router.post("/refreshtoken", authenticateRefreshToken, refreshToken);

// Password reset routes
router.post("/request-password-reset", requestPasswordReset); // Route to request password reset
router.post("/reset-password", resetPassword); // Route to reset password

export default router;
