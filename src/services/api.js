import axios from 'axios';
import toast from 'react-hot-toast';

// Automatically uses your deployed backend URL from the .env file.
// Falls back to local network IP for local development if the .env variable is missing.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`, 
});

// Attach Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🛡️ GLOBAL ERROR SHIELD 🛡️
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server is completely offline or a Network Error occurs
    if (!error.response) {
      toast.error("Cannot connect to server. Ensure your backend is running.");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized / 403 Forbidden (Token expired or user blocked)
    if (status === 401 || status === 403) {
      // Don't spam toasts if they are already on the login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('aurora_token');
        localStorage.removeItem('aurora_role');
        toast.error("Session expired or access restricted. Please log in again.");
        window.location.href = '/login'; // Force redirect to login
      }
    } 
    // Handle 500 Server Errors gracefully
    else if (status >= 500) {
      toast.error("Server encountered an error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;