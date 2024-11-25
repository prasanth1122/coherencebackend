import Subscription from "../models/subscriptionModel.js";
import { calculateEndDate } from "../utils/subscriptionUtils.js"; // Utility function for calculating end dates
import mongoose from "mongoose";

// Utility function: Deactivate a subscription and update its history

// Deactivate the existing subscription and push it to history
const deactivateSubscription = async (subscription, status) => {
  subscription.isActive = false;
  subscription.history.push({
    type: subscription.type,
    startDate: subscription.startDate,
    endDate: subscription.endDate,

    status,
  });
  await subscription.save();
};

// Create, renew, or upgrade a subscription (no downgrade allowed)
export const createSubscription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, type, paymentStatus } = req.body;

    // Verify payment status
    if (paymentStatus !== "completed") {
      return res.status(400).json({ message: "Payment not verified." });
    }

    // Check if the user has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      isActive: true,
    }).session(session);

    if (existingSubscription) {
      if (existingSubscription.type === type) {
        // Renew the subscription of the same type
        const newStartDate = existingSubscription.endDate;
        const newEndDate = calculateEndDate(newStartDate, 1); // 1 month duration

        existingSubscription.history.push({
          type,
          startDate: newStartDate,
          endDate: newEndDate,
          renewedAt: new Date(),
          status: "renewed",
        });

        existingSubscription.endDate = newEndDate;
        await existingSubscription.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          success: true,
          message: "Subscription renewed successfully.",
          data: existingSubscription,
        });
      } else {
        // Prevent downgrade - only allow upgrade (from basic to premium, etc.)
        if (existingSubscription.type == "premium" && type === "basic") {
          return res.status(400).json({
            message: "Downgrade not allowed. You can only upgrade.",
          });
        }

        // Upgrade the subscription
        await deactivateSubscription(existingSubscription, "replaced");

        // Create a new subscription with the new type
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, 1); // 1 month duration

        const newSubscription = new Subscription({
          userId,
          type,
          startDate,
          endDate,
          isActive: true,
          history: [
            {
              type,
              startDate,
              endDate,
              status: "active",
            },
          ],
        });

        await newSubscription.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          success: true,
          message: `Subscription upgraded to ${type} successfully.`,
          data: newSubscription,
        });
      }
    }

    // Create a new subscription if no active subscription exists
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, 1); // 1 month duration

    const newSubscription = new Subscription({
      userId,
      type,
      startDate,
      endDate,
      isActive: true,
      history: [
        {
          type,
          startDate,
          endDate,
          renewedAt: new Date(),
          status: "active",
        },
      ],
    });

    await newSubscription.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "New subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating/updating subscription:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get the user's active subscription
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await Subscription.findOne({ userId, isActive: true });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "No active subscription found." });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const subscription = await Subscription.findOne({ userId, isActive: true });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "No active subscription to cancel." });
    }

    await deactivateSubscription(subscription, "cancelled");

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Cron job to deactivate expired subscriptions
export const deactivateExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    const result = await Subscription.updateMany(
      { isActive: true, endDate: { $lt: now } },
      { $set: { isActive: false } }
    );

    console.log(`${result.modifiedCount || 0} subscriptions were deactivated.`);
  } catch (error) {
    console.error("Error deactivating expired subscriptions:", error);
  }
};
