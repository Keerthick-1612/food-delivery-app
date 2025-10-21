import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createFoodItem, listFoodItems, updateFoodItem, deleteFoodItem, toggleMenuOfTheDay } from "../controllers/foodController.js";
import { addToCart, getCart, updateCartItem, confirmOrder, getAllOrders, getOrderHistory, markOrderAsServed } from "../controllers/orderController.js";

const router = express.Router();

// Register new user (Customer)
router.post("/register", registerUser);

// Login (Admin or Customer)
router.post("/login", loginUser);

// Get Profile (Protected)
router.get("/me", protect, getProfile);

// Admin: Food management
router.post("/food", protect, authorizeRoles("admin"), createFoodItem);
router.get("/food", protect, listFoodItems);
router.put("/food/:id", protect, authorizeRoles("admin"), updateFoodItem);
router.delete("/food/:id", protect, authorizeRoles("admin"), deleteFoodItem);
router.patch("/food/:id/toggle-menu", protect, authorizeRoles("admin"), toggleMenuOfTheDay);

// Customer: Cart and Orders
router.post("/cart/add", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/item/:itemId", protect, updateCartItem);
router.post("/cart/confirm", protect, confirmOrder);

// Admin: Orders
router.get("/orders", protect, authorizeRoles("admin"), getAllOrders);
router.get("/orders/history", protect, authorizeRoles("admin"), getOrderHistory);
router.patch("/orders/:orderId/serve", protect, authorizeRoles("admin"), markOrderAsServed);

export default router;
