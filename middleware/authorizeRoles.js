// File: backend/middlewares/authorizeRoles.js
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    // Assuming req.user has the role information
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient role" });
    }
    next();
  };
};
