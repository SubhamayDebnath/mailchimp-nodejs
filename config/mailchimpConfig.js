
import mailchimp from "@mailchimp/mailchimp_marketing";
import { config } from "dotenv";
config();

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});
export const mailchimpClient = mailchimp;
export const mailchimpListId = process.env.MAILCHIMP_LIST_ID;