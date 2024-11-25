import express from "express";
import {
  createSubscription,
  getUserSubscription,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js"; // Middleware for JWT
import { authorizeRoles } from "../middleware/authorizeRoles.js"; // Middleware for role-based access

const router = express.Router();

// Route to create/renew/upgrade a subscription
router.post(
  "/create",
  authenticateJWT, // Ensure the user is authenticated
  authorizeRoles(["user", "admin"]), // Optional: Role-based access, only users/admins can create subscriptions
  createSubscription
);

// Route to get the user's active subscription
router.get(
  "/:userId",
  authenticateJWT, // Ensure the user is authenticated
  authorizeRoles(["user", "admin"]), // Optional: Role-based access
  getUserSubscription
);

// Route to cancel a subscription
router.post(
  "/cancel",
  authenticateJWT, // Ensure the user is authenticated
  authorizeRoles(["user", "admin"]), // Optional: Role-based access
  cancelSubscription
);

// Cron job route to deactivate expired subscriptions
// This route might not need JWT authentication as it's typically triggered by a cron job (not a user)

export default router;
