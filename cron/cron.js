import cron from "node-cron";
import { processAbandonedCarts } from "../services/getAbandonedTags.js";
// start cron job
export const startCron = () => {
  cron.schedule("* * * * *", () => {
    processAbandonedCarts();
    console.log("Cron is working: Running every minute...");
  });
};