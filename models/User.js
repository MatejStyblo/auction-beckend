import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: Number, unique: true },
  role: { type: String, enum: ["superadmin", "user"], default: "user" },
});

userSchema.pre("save", async function (next) {
  if (this.isNew && this.userId == null) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

export default mongoose.model("User", userSchema);
