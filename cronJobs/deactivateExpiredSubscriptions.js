// File: backend/cronJobs/deactivateExpiredSubscriptions.js

import cron from "node-cron";
import { deactivateExpiredSubscriptions } from "../controllers/subscriptionController.js";

// Schedule the cron job to run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to deactivate expired subscriptions...");
  await deactivateExpiredSubscriptions();
});
