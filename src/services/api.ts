/**
 * Axios instance with JWT interceptor.
 * Automatically attaches Bearer token to all requests.
 * Redirects to /login on 401 responses.
 */
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("tj_access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tj_access_token");
      localStorage.removeItem("tj_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
