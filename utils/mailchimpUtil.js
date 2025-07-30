import {mailchimpClient,mailchimpListId } from "../config/mailchimpConfig.js"

// add tags
export const addTagsToEmail = async (email, tags) => {
  return await mailchimpClient.lists.updateListMemberTags(mailchimpListId, email, {
    tags: tags.map(tag => ({ name: tag, status: "active" }))
  });
};
// get tags
export const getUserTags = async (email) => {
  const res = await mailchimpClient.lists.getListMemberTags(mailchimpListId, email);
  return res.tags.map(t => t.name);
};