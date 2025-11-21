import FoodItem from "../models/FoodItem.js";

class MenuOfTheDayManager {
  constructor() {
    if (MenuOfTheDayManager.instance) {
      return MenuOfTheDayManager.instance;
    }
    this.currentMenuId = null;
    MenuOfTheDayManager.instance = this;
  }

  static getInstance() {
    return new MenuOfTheDayManager();
  }

  async setMenuOfTheDay(newItemId) {
    try {
      // First, deselect any currently selected menu of the day
      if (this.currentMenuId) {
        await FoodItem.findByIdAndUpdate(this.currentMenuId, { isMenuOfTheDay: false });
      }

      // Set the new item as menu of the day
      const newItem = await FoodItem.findByIdAndUpdate(
        newItemId, 
        { isMenuOfTheDay: true }, 
        { new: true }
      );

      if (!newItem) {
        throw new Error("Item not found");
      }

      this.currentMenuId = newItemId;
      return newItem;
    } catch (error) {
      throw error;
    }
  }

  async deselectMenuOfTheDay(itemId) {
    try {
      const item = await FoodItem.findByIdAndUpdate(
        itemId, 
        { isMenuOfTheDay: false }, 
        { new: true }
      );

      if (this.currentMenuId === itemId) {
        this.currentMenuId = null;
      }

      return item;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentMenuId() {
    if (!this.currentMenuId) {
      const current = await FoodItem.findOne({ isMenuOfTheDay: true });
      this.currentMenuId = current ? current._id.toString() : null;
    }
    return this.currentMenuId;
  }
}

export default MenuOfTheDayManager;










