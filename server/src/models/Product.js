import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["comic", "fortune", "song", "documentary", "conversation"],
      unique: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    coinPrice: { type: Number, required: true },
    sampleAssetUrl: { type: String },
    isActive: { type: Boolean, default: true },
    promptQuestions: { type: [String], default: [] }, // exactly 5 per product, drives the checkout wizard
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);