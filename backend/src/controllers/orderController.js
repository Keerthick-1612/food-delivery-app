import Order from "../models/Order.js";
import FoodItem from "../models/FoodItem.js";

export const addToCart = async (req, res) => {
  const { itemId, quantity } = req.body;
  const userId = req.user._id;

  try {
    const foodItem = await FoodItem.findById(itemId);
    if (!foodItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity > foodItem.quantityAvailable) {
      return res.status(400).json({ 
        message: `Only ${foodItem.quantityAvailable} items available` 
      });
    }

    // Find existing pending order for this user
    let order = await Order.findOne({ user: userId, status: "pending" });
    
    if (!order) {
      // Create new pending order
      order = new Order({
        user: userId,
        items: [],
        totalAmount: 0,
        status: "pending"
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = order.items.findIndex(
      item => item.foodItem.toString() === itemId
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newQuantity = order.items[existingItemIndex].quantity + quantity;
      if (newQuantity > foodItem.quantityAvailable) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more. Total would exceed available stock of ${foodItem.quantityAvailable}` 
        });
      }
      order.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      order.items.push({
        foodItem: itemId,
        quantity: quantity,
        price: foodItem.price,
        name: foodItem.name
      });
    }

    // Recalculate total
    order.totalAmount = order.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );

    await order.save();
    await order.populate('items.foodItem', 'name price quantityAvailable');
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCart = async (req, res) => {
  const userId = req.user._id;
  
  try {
    const order = await Order.findOne({ user: userId, status: "pending" })
      .populate('items.foodItem', 'name price quantityAvailable');
    
    res.json(order || { items: [], totalAmount: 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  try {
    const order = await Order.findOne({ user: userId, status: "pending" });
    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = order.items.findIndex(
      item => item.foodItem.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (quantity <= 0) {
      // Remove item from cart
      order.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const foodItem = await FoodItem.findById(itemId);
      if (quantity > foodItem.quantityAvailable) {
        return res.status(400).json({ 
          message: `Only ${foodItem.quantityAvailable} items available` 
        });
      }
      order.items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    order.totalAmount = order.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );

    await order.save();
    await order.populate('items.foodItem', 'name price quantityAvailable');
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmOrder = async (req, res) => {
  const userId = req.user._id;

  try {
    const order = await Order.findOne({ user: userId, status: "pending" })
      .populate('items.foodItem');
    
    if (!order || order.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability for all items
    for (const item of order.items) {
      if (item.quantity > item.foodItem.quantityAvailable) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.foodItem.name}. Available: ${item.foodItem.quantityAvailable}` 
        });
      }
    }

    // Update stock quantities
    for (const item of order.items) {
      await FoodItem.findByIdAndUpdate(
        item.foodItem._id,
        { $inc: { quantityAvailable: -item.quantity } }
      );
    }

    // Confirm the order
    order.status = "confirmed";
    await order.save();
    
    res.json({ message: "Order confirmed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $nin: ["pending", "delivered"] } })
      .populate('user', 'name email')
      .populate('items.foodItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ status: "delivered" })
      .populate('user', 'name email')
      .populate('items.foodItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markOrderAsServed = async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    order.status = "delivered";
    await order.save();
    
    res.json({ message: "Order marked as served", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
