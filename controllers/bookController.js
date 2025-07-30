import mailchimp from "@mailchimp/mailchimp_marketing";
import { config } from "dotenv";
config();
import { isValidEmail, matchBook } from "../utils/utils.js";
import { mailchimpClient ,mailchimpListId } from "../config/mailchimpConfig.js"

// get ping
export const getPing = async (req, res) => {
    try {
        const response = await mailchimpClient.ping.get();
        res.json({ message: response });
    } catch (error) {
        console.error("Ping error:", error);
        res.status(500).json({ error: error.message });
    }
}

// get subscribers
export const getSubscribers = async (req, res) => {
    try {
        const response = await mailchimpClient.lists.getListMembersInfo(mailchimpListId);
        const subscribers = response.members.map((member) => ({
            email: member.email_address,
            status: member.status,
            firstName: member.merge_fields.FNAME,
            lastName: member.merge_fields.LNAME,
            books: member.tags,
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
        const { email, first_name, last_name, books } = req.body; // ex: books = ['EEDP','LEO'] 
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        const firstName = first_name || '';
        const lastName = last_name || '';
        const response = await mailchimpClient.lists.addListMember(mailchimpListId, {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
            }
        });

        // add books if books array is not empty
        if (books.length > 0) {
            await mailchimpClient.lists.updateListMemberTags(mailchimpListId, email, {
                tags: books.map(name => ({ name, status: "active" }))
            })
        }

        res.status(200).json({ message: "Subscriber Added Successfully", response: response });

    } catch (error) {
        console.error("Add subscriber error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// update books
export const updateBooks = async (req, res) => {
    try {
        const { email, newBooks } = req.body; //ex:  newBook=['EEDP','LEO']
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        // for array
        if (!Array.isArray(newBooks) || newBooks.length === 0) {
            return res.status(400).json({ error: "New Books must be a non-empty array" });
        }

        //for string
        /* 
        if(typeof newBooks === 'string' && !newBooks){
            return res.status(400).json({ error: "New Books must be a non-empty string" });
        }
        */

        // optional if existing subscriber 
        const existingSubscriber = await mailchimpClient.lists.getListMember(mailchimpListId, email);
        if (!existingSubscriber) {
            return res.status(404).json({ error: "Subscriber not found" });
        }
        // get book previous tags
        const getBookTags = await mailchimpClient.lists.getListMemberTags(mailchimpListId, email);
        const bookTagList = getBookTags.tags.map(tag => tag.name);

        // for array  of books (currently in use)
        const updatedBookTagsList = [...new Set([...bookTagList, ...newBooks.map(name => name.trim())])];

        // for single book (uncomment below for single book)
        /**
         
        bookTagList.push("newBook");
        const updatedBookTagsList = [...new Set(bookTagList)]; 
        
        **/

        // update book tags
        await mailchimpClient.lists.updateListMemberTags(mailchimpListId, email, {
            tags: updatedBookTagsList.map(name => ({ name, status: "active" }))
        })

        return res.status(200).json({ message: "Books updated successfully" });
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
        // get all Subscribers
        const subscriberData = await mailchimpClient.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);

        // Filter subscribers based on the target book
        const subscribers = subscriberData.members
            .filter((member) => member.status === "subscribed" && member.tags_count > 0)
            .filter((member) => {
                const tagsList = member.tags.map((tag) => tag.name);
                if (tagsList.length === 0) return true;
                return !tagsList.some((tag) => {
                    return matchBook(tag.name, targetBook);
                })
            })
            .map((member) => ({
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

// 