import crypto from "crypto";
import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// Request Password Reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Generate a secure random 6-digit numeric code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Set token and expiration in user document
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Use the environment variable
      port: process.env.EMAIL_PORT, // Use the environment variable
      secure: false, // Use false because port 2525 doesn't use SSL/TLS
      auth: {
        user: process.env.EMAIL_USER, // Use the environment variable
        pass: process.env.EMAIL_PASSWORD, // Use the environment variable
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Use your email address here
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}. This code is valid for 15 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset code sent to your email." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error requesting password reset.", error });
  }
};

export const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: resetCode,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code." });

    // Hash the new password
    const saltRounds = 10; // Adjust this if needed
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password successfully reset." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password.", error });
  }
};
