import Cart from "../models/cartModel.js"
import { getUserTags, addTagsToEmail } from "../utils/mailchimpUtil.js"
import {mailchimpClient,mailchimpListId } from "../config/mailchimpConfig.js"

// abandoned cart
export const processAbandonedCarts = async () => {
    // const thresholdTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    const thresholdTime = new Date(Date.now() - 1 * 60 * 1000); // for testing 1min
    const carts = await Cart.find({ books: { $elemMatch: { time: { $lte: thresholdTime } } } });
    
    for (const cart of carts) {
        const { email, books } = cart;
        try {
            // check if subscriber
            const existingSubscriber = await mailchimpClient.lists.getListMember(mailchimpListId, email);
            if (!existingSubscriber) {
                console.log("Subscriber not found");
            }
            // get tags
            const existingTags = await getUserTags(email);
            // check if cart is abandoned
            for (const book of books) {
                const bookTime = new Date(book.time);
                if (bookTime <= thresholdTime) {
                    const purchaseTag = `PURCHASED_${book.name.toUpperCase()}`;
                    const abandonedTag = `ABANDONED_${book.name.toUpperCase()}`;
                    if (!existingTags.includes(purchaseTag) && !existingTags.includes(abandonedTag)) {
                        // add abandoned tag
                        await addTagsToEmail(email, [abandonedTag]);
                        console.log(`Tagged ${email} with ${abandonedTag}`);
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
}