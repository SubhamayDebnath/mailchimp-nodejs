import { config } from "dotenv";
config();
import express from "express";
import DBConnection from "./config/DBConnection.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use("/api", bookRoutes);
app.use("/cart",cartRoutes);


app.listen(port, () => {
  DBConnection();
  console.log(`Server is running on http://localhost:${port}`);
})