import Cart from "../models/cartModel.js";
import { mailchimpClient, mailchimpListId } from "../config/mailchimpConfig.js";
// cart
export const getCart = async (req, res) => {
    try {
        const data = await Cart.find();
        if (!data) {
            res.status(400).json({ message: "Cart is empty", response: data });
        } else {
            res.status(200).json({ message: "Cart Fetched Successfully", response: data });
        }
    } catch (error) {
        console.error("Get Cart error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// add to cart
export const addToCart = async (req, res) => {
    try {
        const { username, books } = req.body;
        if (!username || !books) {
            return res.status(400).json({ error: "Please provide username and books" });
        }
        const cart = await Cart.create({ email: username, books: books });
        if (!cart) {
            return res.status(400).json({ error: "Something went wrong" });
        }
        res.status(200).json({ message: "Added to Cart Successfully", response: cart });
    } catch (error) {
        console.error("Add to Cart error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// get abandoned cart
export const getAbandonedCartUsers = async (req, res) => {
    try {
        const response = await mailchimpClient.lists.getListMembersInfo(mailchimpListId);
        const users = response.members;
        const abandonedUsers = [];
        for (const user of users) {
            const email = user.email_address;
            const memberId = user.id;
            const tagRes = await mailchimpClient.lists.getListMemberTags(mailchimpListId, memberId);
            const tags = tagRes.tags.map(tag => tag.name);
            const abandonedTags = tags.filter(tag => tag.startsWith("ABANDONED_"));
            if (abandonedTags.length > 0) {
                abandonedUsers.push({ email, abandonedTags });
            }
        }
        res.status(200).json({
            message: "Abandoned cart users fetched successfully",
            data: abandonedUsers
        });
    } catch (error) {
        console.error("get abandoned cart:", error.message);
        res.status(500).json({ error: error.message })
    }
}