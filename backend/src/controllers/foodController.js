import FoodItem from "../models/FoodItem.js";
import Counter from "../models/Counter.js";
import { FoodItemFactory } from "../factories/FoodItemFactory.js";
import MenuOfTheDayManager from "../services/MenuOfTheDayManager.js";

// Helper function to escape special regex characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const createFoodItem = async (req, res) => {
  try {
    const base = FoodItemFactory.createPayload(req.body);
    
    // Check for duplicate name (case-insensitive)
    // base.name is already trimmed by FoodItemFactory
    const escapedName = escapeRegex(base.name);
    const existingItem = await FoodItem.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });
    
    if (existingItem) {
      return res.status(400).json({ 
        message: `Item already exists with name: ${existingItem.name}` 
      });
    }
    
    // Atomically increment counter for FoodItem IDs
    const counter = await Counter.findByIdAndUpdate(
      "foodItem",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const item = await FoodItem.create({
      name: base.name,
      price: base.price,
      quantityAvailable: base.quantityAvailable,
      itemId: counter.seq,
      description: base.description,
      category: base.category,
      cookingTime: base.cookingTime,
      isAvailable: base.isAvailable,
    });
    res.status(201).json(item);
  } catch (err) {
    // Handle validation errors from FoodItemFactory
    if (err.message) {
      if (err.message.includes("Negative or invalid values")) {
        return res.status(400).json({ message: err.message });
      }
      if (err.message.includes("required") || err.message.includes("No input provided")) {
        return res.status(400).json({ message: err.message });
      }
    }
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      const negativeFields = fields.filter(field => {
        const error = err.errors[field];
        return error && (error.kind === "min" || error.message?.includes("minimum"));
      });
      
      if (negativeFields.length > 0) {
        const fieldMessages = negativeFields.map(field => {
          const error = err.errors[field];
          if (field === "cookingTime") {
            return "cookingTime (must be at least 1)";
          }
          return `${field} (must be 0 or greater)`;
        });
        return res.status(400).json({ 
          message: `Negative or invalid values not allowed for: ${fieldMessages.join(", ")}` 
        });
      }
      return res.status(400).json({ message: err.message || "Validation error" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, quantityAvailable, description, category, cookingTime, isAvailable } = req.body;
  try {
    const item = await FoodItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Check for duplicate name (case-insensitive) if name is being updated
    if (name != null) {
      const trimmedName = name.trim();
      // Don't allow empty names
      if (trimmedName === '') {
        return res.status(400).json({ 
          message: "Item name cannot be empty" 
        });
      }
      
      const escapedName = escapeRegex(trimmedName);
      const existingItem = await FoodItem.findOne({
        _id: { $ne: id }, // Exclude current item
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
      });
      
      if (existingItem) {
        return res.status(400).json({ 
          message: `Item already exists with name: ${existingItem.name}` 
        });
      }
    }

    // Validate numeric fields for negative values before updating
    const negativeFields = [];
    if (price != null) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        negativeFields.push("price");
      }
    }
    if (quantityAvailable != null) {
      const numQuantityAvailable = Number(quantityAvailable);
      if (isNaN(numQuantityAvailable) || numQuantityAvailable < 0) {
        negativeFields.push("quantityAvailable");
      }
    }
    if (cookingTime != null) {
      const numCookingTime = Number(cookingTime);
      if (isNaN(numCookingTime) || numCookingTime < 1) {
        negativeFields.push("cookingTime (must be at least 1)");
      }
    }

    if (negativeFields.length > 0) {
      const fieldList = negativeFields.join(", ");
      return res.status(400).json({ 
        message: `Negative or invalid values not allowed for: ${fieldList}` 
      });
    }

    // Update fields only if provided
    if (name != null) item.name = name.trim();
    if (price != null) item.price = Number(price);
    if (quantityAvailable != null) item.quantityAvailable = Number(quantityAvailable);
    if (description != null) item.description = description;
    if (category != null) item.category = category;
    if (cookingTime != null) item.cookingTime = Number(cookingTime);
    if (isAvailable != null) item.isAvailable = isAvailable;

    const saved = await item.save();
    res.json(saved);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      const negativeFields = fields.filter(field => {
        const error = err.errors[field];
        return error && (error.kind === "min" || error.message?.includes("minimum"));
      });
      
      if (negativeFields.length > 0) {
        const fieldMessages = negativeFields.map(field => {
          const error = err.errors[field];
          if (field === "cookingTime") {
            return "cookingTime (must be at least 1)";
          }
          return `${field} (must be 0 or greater)`;
        });
        return res.status(400).json({ 
          message: `Negative or invalid values not allowed for: ${fieldMessages.join(", ")}` 
        });
      }
      return res.status(400).json({ message: err.message || "Validation error" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteFoodItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await FoodItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleMenuOfTheDay = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await FoodItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const manager = MenuOfTheDayManager.getInstance();
    
    if (item.isMenuOfTheDay) {
      // Deselect current menu of the day
      const updatedItem = await manager.deselectMenuOfTheDay(id);
      res.json({ 
        ...updatedItem.toObject(), 
        message: "Removed from Menu of the Day" 
      });
    } else {
      // Check if there's already a menu of the day
      const currentMenuId = await manager.getCurrentMenuId();
      if (currentMenuId && currentMenuId !== id) {
        return res.status(400).json({ 
          message: "Only one item can be Menu of the Day. Please deselect the current one first." 
        });
      }
      
      // Set new menu of the day
      const updatedItem = await manager.setMenuOfTheDay(id);
      res.json({ 
        ...updatedItem.toObject(), 
        message: "Set as Menu of the Day" 
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


