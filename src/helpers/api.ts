import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/v1", // Changed from 5000 to 3000 to match backend
});

// Optional: attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
