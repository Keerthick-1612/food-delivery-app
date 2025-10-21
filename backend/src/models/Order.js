import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        name: { type: String, required: true }, // Store name for historical reference
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"], 
      default: "pending" 
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

