import Subscription from "../models/subscriptionModel.js";

export const checkSubscription = (requiredAccessLevel) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // Assuming `req.user` contains authenticated user information
      const subscription = await Subscription.findOne({
        userId,
        isActive: true,
        endDate: { $gte: new Date() }, // Ensure the subscription is still valid
      });

      if (!subscription) {
        return res.status(403).json({
          message: "Access denied. No valid subscription found.",
        });
      }

      // Define access levels hierarchy
      const accessLevels = ["free", "basic", "premium", "institutional"];
      const userAccessIndex = accessLevels.indexOf(subscription.type);
      const requiredAccessIndex = accessLevels.indexOf(requiredAccessLevel);

      // Ensure the user's subscription level allows access to the required level
      if (userAccessIndex === -1 || userAccessIndex < requiredAccessIndex) {
        return res.status(403).json({
          message: `Access denied. Upgrade to ${requiredAccessLevel} subscription.`,
        });
      }

      // Proceed to the next middleware/controller
      next();
    } catch (err) {
      res.status(500).json({
        message: "Error validating subscription.",
        error: err.message,
      });
    }
  };
};
