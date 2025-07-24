import { config } from "dotenv";
config();
import express from "express";
import mailchimp from "@mailchimp/mailchimp_marketing";


const app = express();
const port = process.env.PORT;
app.use(express.json());

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

// check email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

app.get("/", async (req, res) => {
  try {
    const response = await mailchimp.ping.get();
    res.json({ message: response });
  } catch (error) {
    console.error("Ping error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// add subscriber 
app.post("/api/add-subscriber", async (req, res) => {
  try {
    const { email, first_name, last_name, books } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const firstName = first_name || '';
    const lastName = last_name || '';
    const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        BOOKS: books
      }
    });
    res.status(200).json({ message: "Subscriber Added Successfully", response: response });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message })
  }
})

// get subscribers
app.get("/api/get-subscribers", async (req, res) => {
  try {
    const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);
    const subscribers = response.members.map((member) => ({
      email: member.email_address,
      status: member.status,
      firstName: member.merge_fields.FNAME,
      lastName: member.merge_fields.LNAME,
      books: member.merge_fields.BOOKS,
    }));
    res.status(200).json({ message: "Subscriber Fetched Successfully", response: subscribers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message })
  }
})

// filter subscribers based on books
app.post('/api/filter-subscribers', async (req, res) => {
  try {
    const { targetBook } = req.body;
    if (!targetBook) {
      return res.status(400).json({ error: "Please provide a book name" });
    }
    const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);

    // Filter subscribers based on the target book

    const subscribers = response.members.filter((member) => member.status === "subscribed" && member.merge_fields.BOOKS !== "").filter((member) => {
      // Split the books string into an array
      const books = member.merge_fields.BOOKS.split(",");
      const pattern = new RegExp(`\\b${targetBook}\\b`, "i");
      // Check if any book matches the pattern
      const hasAnyBook = books.some(book => {
        return pattern.test(book);
      });
      return hasAnyBook;
    }).map((member) => ({
      email: member.email_address,
      firstName: member.merge_fields.FNAME,
      lastName: member.merge_fields.LNAME
    }))

    res.status(200).json({ message: "Filtered Subscribers Fetched Successfully", response: subscribers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message })
  }
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})