import mongoose from "mongoose";

// Sub-schema for comments
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Sub-schema for ratings
const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

// Main Article Schema
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Nature", "Computers", "Economics", "General"],
      required: true,
    },
    content: {
      introduction: { type: String, required: true },
      valueProposition: { type: String, required: true },
    },
    author: { type: String, required: true },
    isMonthlyEdition: { type: Boolean, default: false },
    parentArticle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
      validate: {
        validator: async function (parentArticleId) {
          if (parentArticleId) {
            // Make sure the parent article exists
            const parentArticle = await mongoose
              .model("Article")
              .findById(parentArticleId);
            if (!parentArticle) {
              throw new Error("Parent article does not exist.");
            }
          }
        },
        message: "Invalid parent article ID.",
      },
    },
    subArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    subArticlesCount: { type: Number, default: 0 }, // Keeps track of the number of sub-articles
    month: { type: Number },
    year: { type: Number },
    views: { type: Number, default: 0 },
    comments: [commentSchema],
    commentCount: { type: Number, default: 0 },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    accessLevel: {
      type: String,
      enum: ["free", "basic", "premium", "institutional"], // Access level based on subscription
      default: "free",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

// Pre-save middleware for category enforcement, sub-article update, and averageRating calculation
articleSchema.pre("save", function (next) {
  // Ensure category is "General" for monthly articles
  if (this.isMonthlyEdition) {
    this.category = "General";
  }

  // Calculate average rating if ratings exist
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, rate) => sum + rate.rating, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0;
  }

  // Update commentCount dynamically
  this.commentCount = this.comments.length;

  // If this article has a parent, ensure it updates its subArticlesCount
  if (this.parentArticle) {
    this.subArticlesCount = this.subArticles.length;
  }

  next();
});

// Post-save middleware to update the parent article's subArticles array (if it's a sub-article)
articleSchema.post("save", async function (doc) {
  if (doc.parentArticle) {
    // Add this sub-article's ID to the parent article's subArticles array
    await mongoose.model("Article").findByIdAndUpdate(
      doc.parentArticle,
      {
        $push: { subArticles: doc._id },
        $inc: { subArticlesCount: 1 }, // Increment sub-articles count in parent article
      },
      { new: true }
    );
  }
});

const CoherenceArticles = mongoose.model(
  "Article",
  articleSchema,
  "coherenceArticles"
);

export default CoherenceArticles;
