import mailchimp from "@mailchimp/mailchimp_marketing";
import { isValidEmail } from "../utils/emailValidator.js";
// Configure Mailchimp
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
});

const mailchimpListId = process.env.MAILCHIMP_LIST_ID;

// get ping
export const getPing = async (req, res) => {
    try {
        const response = await mailchimp.ping.get();
        res.json({ message: response });
    } catch (error) {
        console.error("Ping error:", error);
        res.status(500).json({ error: error.message });
    }
}

// get subscribers
export const getSubscribers = async (req, res) => {
    try {
        const response = await mailchimp.lists.getListMembersInfo(mailchimpListId);
        const subscribers = response.members.map((member) => ({
            email: member.email_address,
            status: member.status,
            firstName: member.merge_fields.FNAME,
            lastName: member.merge_fields.LNAME,
            books: member.merge_fields.BOOKS,
        }));
        res.status(200).json({ message: "Subscriber Fetched Successfully", response: subscribers });
    } catch (error) {
        console.error("Get subscriber error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// add subscribers
export const addSubscriber = async (req, res) => {
    try {
        const { email, first_name, last_name, books } = req.body; // ex: books = ['abol','leo'] 
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        const firstName = first_name || '';
        const lastName = last_name || '';
        const bookList = Array.isArray(books) ? books.join(",") : '';
        const response = await mailchimp.lists.addListMember(mailchimpListId, {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
                BOOKS: bookList
            }
        });
        res.status(200).json({ message: "Subscriber Added Successfully", response: response });

    } catch (error) {
        console.error("Add subscriber error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// update books
export const updateBooks = async (req, res) => {
    try {
        const { email, newBooks } = req.body; //ex:  newBook=['abol','leo']
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (!Array.isArray(newBooks) || newBooks.length === 0) {
            return res.status(400).json({ error: "New Books must be a non-empty array" });
        }
        // get previous books
        const subscriber = await mailchimp.lists.getListMember(mailchimpListId, email);
        const subscriberPreviousBooks = subscriber.merge_fields.BOOKS;
        // split previous books
        const previousBooks = subscriberPreviousBooks
            ? subscriberPreviousBooks.split(",").map(b => b.trim())
            : [];
        // combine previous books and new books
        const combinedBooks = [...previousBooks, ...newBooks.map(b => b.trim())];
        // remove duplicates
        const uniqueBooks = [...new Set(combinedBooks)];
        const normalizedNewBooks = uniqueBooks.join(",");
        const response = await mailchimp.lists.updateListMember(mailchimpListId, email, {
            merge_fields: {
                BOOKS: normalizedNewBooks
            }
        });
        return res.status(200).json({ message: "Books updated", response: response });
    } catch (error) {
        console.error("Update subscriber error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// filter subscribers based on books
export const filterSubscribers = async (req, res) => {
    try {
        const { targetBook } = req.body; // for single book
        if (!targetBook) {
            return res.status(400).json({ error: "Please provide a book name" });
        }
        const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);

        // Filter subscribers based on the target book
        const subscribers = response.members.filter((member) => member.status === "subscribed" && member.merge_fields.BOOKS === "").filter((member) => {
            // Split the books string into an array
            const books = member.merge_fields.BOOKS.split(",");
            const pattern = new RegExp(`\\b${targetBook}\\b`, "i");
            // Check if any book matches the pattern
            const hasAnyBook = books.some(book => {
                return pattern.test(book);
            });
            return !hasAnyBook;
        }).map((member) => ({
            email: member.email_address,
            firstName: member.merge_fields.FNAME,
            lastName: member.merge_fields.LNAME
        }))

        res.status(200).json({ message: "Filtered Subscribers Fetched Successfully", response: subscribers });
    } catch (error) {
        console.error("Filter subscriber error:", error.message);
        res.status(500).json({ error: error.message })
    }
}