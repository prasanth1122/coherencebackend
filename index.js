import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // Import cookie-parser

import userRoutes from "../backend/routes/userRoutes.js";
import subscriptionRoutes from "../backend/routes/subscriptionRoutes.js";
import articleRoutes from "../backend/routes/articleRoutes.js";
import "../backend/cronJobs/deactivateExpiredSubscriptions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(express.json());
app.use(cookieParser()); // Add this middleware here

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/articles", articleRoutes);

// Default route for testing server
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
