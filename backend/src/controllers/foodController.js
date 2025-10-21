import FoodItem from "../models/FoodItem.js";
import Counter from "../models/Counter.js";
import { FoodItemFactory } from "../factories/FoodItemFactory.js";
import MenuOfTheDayManager from "../services/MenuOfTheDayManager.js";

export const createFoodItem = async (req, res) => {
  try {
    const base = FoodItemFactory.createPayload(req.body);
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
      isAvailable: base.isAvailable,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
  const { name, price, quantityAvailable, description, category, isAvailable } = req.body;
  try {
    const item = await FoodItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (name != null) item.name = name;
    if (price != null) item.price = price;
    if (quantityAvailable != null) item.quantityAvailable = quantityAvailable;
    if (description != null) item.description = description;
    if (category != null) item.category = category;
    if (isAvailable != null) item.isAvailable = isAvailable;

    const saved = await item.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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


