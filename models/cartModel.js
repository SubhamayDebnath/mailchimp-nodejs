import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  email: { type: String, required: true },
  books: [{ name: String , time: { type: Date, default: Date.now } }],
}, {
  timestamps: true 
});

export default mongoose.model("Cart", cartSchema);
