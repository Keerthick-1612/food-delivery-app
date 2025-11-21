import mongoose from "mongoose";
import FoodItem from "../src/models/FoodItem.js";

// Migration script to add default cooking time to existing food items
const migrateCookingTime = async () => {
  try {
    console.log("Starting migration: Adding cooking time to existing food items...");
    
    // Find all food items that don't have cookingTime field
    const itemsWithoutCookingTime = await FoodItem.find({ 
      cookingTime: { $exists: false } 
    });
    
    console.log(`Found ${itemsWithoutCookingTime.length} items without cooking time`);
    
    if (itemsWithoutCookingTime.length > 0) {
      // Update all items without cookingTime to have default 5 minutes
      const result = await FoodItem.updateMany(
        { cookingTime: { $exists: false } },
        { $set: { cookingTime: 5 } }
      );
      
      console.log(`Updated ${result.modifiedCount} items with default cooking time of 5 minutes`);
    } else {
      console.log("No items need updating - all items already have cooking time");
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to database
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/food_delivery";
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      return migrateCookingTime();
    })
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export default migrateCookingTime;
