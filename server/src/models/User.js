import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    coinBalance: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    guestSessionId: { type: String },
    lastEngagementResetAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);