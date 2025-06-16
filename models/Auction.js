import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  minimumBid: {
    type: Number,
    required: true,
    default: 100, // výchozí minimální příhoz
  },
  image: String,
});

export default mongoose.model("Auction", auctionSchema);
