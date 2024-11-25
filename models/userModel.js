import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Hashed password
    role: {
      type: String,
      enum: ["admin", "user"], // Allowed roles
      default: "user", // Default role
    },
    userType: {
      type: String,
      enum: ["student", "educator"], // User types for 'user' role
      default: "student",
    },
    refreshToken: { type: String },
    lastLogin: { type: Date, default: null }, // Optional
    resetPasswordToken: { type: String }, // Token for password reset
    resetPasswordExpires: { type: Date }, // Expiry time for reset token
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema, "userData");
export default User;
