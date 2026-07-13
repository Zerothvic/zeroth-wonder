import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    coinBalance: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    guestSessionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);