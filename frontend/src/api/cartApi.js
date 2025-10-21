import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const addToCart = (data, token) =>
  axios.post(`${API_BASE}/users/cart/add`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCart = (token) =>
  axios.get(`${API_BASE}/users/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateCartItem = (itemId, data, token) =>
  axios.put(`${API_BASE}/users/cart/item/${itemId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const confirmOrder = (token) =>
  axios.post(`${API_BASE}/users/cart/confirm`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllOrders = (token) =>
  axios.get(`${API_BASE}/users/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrderHistory = (token) =>
  axios.get(`${API_BASE}/users/orders/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const markOrderAsServed = (orderId, token) =>
  axios.patch(`${API_BASE}/users/orders/${orderId}/serve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCustomerOrderHistory = (token) =>
  axios.get(`${API_BASE}/users/orders/customer-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });