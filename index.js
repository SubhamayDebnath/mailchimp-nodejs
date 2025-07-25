import { config } from "dotenv";
config();
import express from "express";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use("/api", bookRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})