import Order from "../models/Order.js";
import FoodItem from "../models/FoodItem.js";
import { getOrderNotifier } from "../services/notifiers/OrderNotifier.js";

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
      .populate('items.foodItem', 'name price quantityAvailable cookingTime');
    
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
    
    // Notify all observers about order confirmation (Observer Pattern)
    // Get user email and name from req.user (available from auth middleware)
    const userEmail = req.user.email;
    const userName = req.user.name;
    
    // Use OrderNotifier to notify all registered observers (non-blocking)
    const notifier = getOrderNotifier();
    await notifier.notifyObservers({
      order,
      userEmail,
      userName,
      eventType: "order_confirmed"
    });
    
    res.json({ message: "Order confirmed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Get orders sorted by creation time (oldest first) - let database handle sorting
    const orders = await Order.find({ status: { $nin: ["pending", "delivered"] } })
      .populate('user', 'name email')
      .populate('items.foodItem', 'name price cookingTime')
      .sort({ createdAt: 1 }); // Database sorts by creation time
    
    // Apply priority rules efficiently using createdAt comparison
    const orderedOrders = applyQueueOrdering(orders);
    
    res.json(orderedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Function to apply queue-based ordering with priority rules
// Orders are already sorted by createdAt from database, so no need to sort again
const applyQueueOrdering = (orders) => {
  if (orders.length <= 1) return orders;
  
  const orderedOrders = [...orders];
  
  // Apply priority rules: new orders can move ahead ONCE (one position only) if:
  // 1. Time difference with previous order < 3 minutes  
  // 2. Different users (prevents same customer from jumping ahead)
  // 3. Cooking time difference > 15 minutes (current order cooks faster)
  
  // Process each order to see if it can move ahead
  for (let i = 1; i < orderedOrders.length; i++) {
    const currentOrder = orderedOrders[i];
    
    // Check if this order can move ahead of the previous order
    const previousOrder = orderedOrders[i - 1];
    
    // Use createdAt timestamps directly (already sorted by database)
    const timeDiffMinutes = (new Date(currentOrder.createdAt) - new Date(previousOrder.createdAt)) / (1000 * 60);
    
    // Calculate cooking times for both orders
    const currentCookingTime = calculateOrderCookingTime(currentOrder);
    const previousCookingTime = calculateOrderCookingTime(previousOrder);
    const cookingTimeDiff = previousCookingTime - currentCookingTime;
    
    // Check if current order can move ahead
    // Conditions: users must be different AND cooking time difference > 15 minutes AND time difference < 3 minutes
    const currentUserId = currentOrder.user._id || currentOrder.user;
    const previousUserId = previousOrder.user._id || previousOrder.user;
    const usersAreDifferent = currentUserId.toString() !== previousUserId.toString();
    
    if (timeDiffMinutes < 3 && usersAreDifferent && cookingTimeDiff > 15) {
      // Move current order ONE POSITION AHEAD ONLY (not multiple positions)
      [orderedOrders[i - 1], orderedOrders[i]] = [orderedOrders[i], orderedOrders[i - 1]];
    }
  }
  
  return orderedOrders;
};

// Helper function to calculate total cooking time for an order
const calculateOrderCookingTime = (order) => {
  // Get unique food items and their cooking times
  const uniqueItems = new Map();
  order.items.forEach(item => {
    if (item.foodItem && item.foodItem.cookingTime) {
      uniqueItems.set(item.foodItem._id, item.foodItem.cookingTime);
    }
  });
  
  // Sum up cooking times (once per unique food item, not per quantity)
  return Array.from(uniqueItems.values()).reduce((total, time) => total + time, 0);
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

export const getCustomerOrderHistory = async (req, res) => {
  const userId = req.user._id;
  
  try {
    const orders = await Order.find({ 
      user: userId, 
      status: { $nin: ["pending"] } 
    })
      .populate('user', 'name email')
      .populate('items.foodItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};