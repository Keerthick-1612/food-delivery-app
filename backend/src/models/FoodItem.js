import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    itemId: { type: Number, required: true, unique: true },
    description: { type: String },
    category: { type: String },
    cookingTime: { type: Number, default: 5, min: 1 }, // Cooking time in minutes, default 5
    isAvailable: { type: Boolean, default: true },
    isMenuOfTheDay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("FoodItem", foodItemSchema);


