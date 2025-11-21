import mongoose from "mongoose";
import FoodItem from "./src/models/FoodItem.js";

// Simple migration script to add cooking time to existing items
const runMigration = async () => {
  try {
    console.log("🔧 Starting migration: Adding cooking time to existing food items...");
    
    // Find all food items that don't have cookingTime field
    const itemsWithoutCookingTime = await FoodItem.find({ 
      cookingTime: { $exists: false } 
    });
    
    console.log(`📊 Found ${itemsWithoutCookingTime.length} items without cooking time`);
    
    if (itemsWithoutCookingTime.length > 0) {
      // Update all items without cookingTime to have default 5 minutes
      const result = await FoodItem.updateMany(
        { cookingTime: { $exists: false } },
        { $set: { cookingTime: 5 } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} items with default cooking time of 5 minutes`);
    } else {
      console.log("✅ No items need updating - all items already have cooking time");
    }
    
    // Verify the migration
    const totalItems = await FoodItem.countDocuments();
    const itemsWithCookingTime = await FoodItem.countDocuments({ cookingTime: { $exists: true } });
    
    console.log(`📈 Migration Summary:`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Items with cooking time: ${itemsWithCookingTime}`);
    console.log(`   Items missing cooking time: ${totalItems - itemsWithCookingTime}`);
    
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run the migration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/food_delivery";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("🔗 Connected to MongoDB");
    return runMigration();
  })
  .then(() => {
    console.log("🏁 Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration process failed:", error);
    process.exit(1);
  });
