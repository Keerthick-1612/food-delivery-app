import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const loginUser = (data) => axios.post(`${API_BASE}/users/login`, data);

export const registerUser = (data) => axios.post(`${API_BASE}/users/register`, data);

export const getProfile = (token) =>
  axios.get(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

