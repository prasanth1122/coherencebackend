import bcrypt from "bcrypt";
import User from "../../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password explicitly
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      userType,
    });

    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: { id: newUser._id, name: newUser.name, role: newUser.role },
      });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
