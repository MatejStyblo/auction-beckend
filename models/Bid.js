import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  amount: Number,
  time: Date,
  name: String
});

export default mongoose.model("Bid", bidSchema);
