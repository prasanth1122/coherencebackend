import express from "express";
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articlesController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { checkSubscription } from "../middleware/subscriptionCheck.js";
import CoherenceArticles from "../models/articles/coherenceSchema.js";
const router = express.Router();

// Public Routes
router.get("/", authenticateJWT, getAllArticles); // Public articles endpoint

// Protected Routes for Article Viewing
router.get(
  "/:id",
  authenticateJWT,
  async (req, res, next) => {
    try {
      const articleId = req.params.id;
      const article = await CoherenceArticles.findById(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Dynamically pass the article's access level to the middleware
      const middleware = checkSubscription(article.accessLevel);
      return middleware(req, res, next);
    } catch (err) {
      res.status(500).json({
        message: "Error validating article access level.",
        error: err.message,
      });
    }
  },
  getArticleById
);

// Protected Routes (Admin Only)
router.post("/", authenticateJWT, authorizeRoles(["admin"]), createArticle);
router.put("/:id", authenticateJWT, authorizeRoles(["admin"]), updateArticle);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  deleteArticle
);

export default router;
