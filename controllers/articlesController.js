import Article from "../models/articles/coherenceSchema.js";

// Get all articles (public)
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch articles", error: err });
  }
};

// Get specific article (public)
export const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    // Increment the views count by 1
    article.views += 1;

    // Save the updated article document
    await article.save();
    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ message: "Error fetching article", error: err });
  }
};

// Create new article (admin-only)
export const createArticle = async (req, res) => {
  try {
    const newArticle = await Article.create(req.body);
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ message: "Error creating article", error: err });
  }
};

// Update article (admin-only)
export const updateArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedArticle = await Article.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedArticle)
      return res.status(404).json({ message: "Article not found" });
    res.status(200).json(updatedArticle);
  } catch (err) {
    res.status(500).json({ message: "Error updating article", error: err });
  }
};

// Delete article (admin-only)
export const deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the parent article
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle)
      return res.status(404).json({ message: "Article not found" });

    // If the deleted article has sub-articles, delete them
    if (deletedArticle.subArticles && deletedArticle.subArticles.length > 0) {
      await Article.deleteMany({ _id: { $in: deletedArticle.subArticles } });
    }

    // If the deleted article is a parent (monthly edition), remove references from its sub-articles
    if (deletedArticle.isMonthlyEdition) {
      await Article.updateMany(
        { parentArticle: id },
        { $set: { parentArticle: null } }
      );
    }

    res
      .status(200)
      .json({ message: "Article and sub-articles deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting article", error: err });
  }
};
