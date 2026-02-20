
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors (redirect to login if needed)
    if (error.response && error.response.status === 401) {
      // Potentially redirect or cleanup storage
    }
    return Promise.reject(error);
  }
);

export default api;
