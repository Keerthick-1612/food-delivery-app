import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const createFoodItem = (data, token) =>
  axios.post(`${API_BASE}/users/food`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getFoodItems = (token) =>
  axios.get(`${API_BASE}/users/food`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateFoodItem = (id, data, token) =>
  axios.put(`${API_BASE}/users/food/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFoodItem = (id, token) =>
  axios.delete(`${API_BASE}/users/food/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const toggleMenuOfTheDay = (id, token) =>
  axios.patch(`${API_BASE}/users/food/${id}/toggle-menu`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });


