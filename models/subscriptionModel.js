import mongoose from "mongoose";

// Define subscription schema
const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to user
    type: {
      type: String,
      enum: ["free", "basic", "premium", "institutional"],
      default: "free",
    },
    startDate: { type: Date, default: Date.now }, // Subscription start date
    endDate: { type: Date, required: true }, // Subscription end date
    isActive: { type: Boolean, default: true }, // Active status
    history: [
      {
        type: {
          type: String,
          enum: ["free", "basic", "premium", "institutional"],
          required: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        renewedAt: { type: Date, default: null }, // Renewal timestamp
        status: {
          type: String,
          enum: ["active", "expired", "renewed", "replaced", "cancelled"],
          default: "active",
        },
      },
    ],
  },
  { timestamps: true }
);

// Add indexing for performance optimization
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ endDate: 1 });

// Export the model
const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema,
  "subscriptionData"
);
export default Subscription;
