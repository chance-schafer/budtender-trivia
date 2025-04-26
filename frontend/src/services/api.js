import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Adds token to 'x-access-token' header.
apiService.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("user");
    // ** ADDED/VERIFIED LOGS **
    console.log(">>> Interceptor: Running for request to:", config.url); // Log which request
    console.log(">>> Interceptor: userString from localStorage:", userString);
    if (userString) {
      try {
        const user = JSON.parse(userString);
        console.log(">>> Interceptor: Parsed user:", user);
        if (user && user.accessToken) {
          console.log(">>> Interceptor: Found accessToken:", user.accessToken);
          config.headers["x-access-token"] = user.accessToken;
          console.log(">>> Interceptor: Set x-access-token header:", config.headers["x-access-token"]);
        } else {
          console.log(">>> Interceptor: Parsed user object or accessToken property is missing/falsy.");
        }
      } catch (e) {
        console.error(">>> Interceptor: Error parsing user from localStorage", e);
      }
    } else {
      console.log(">>> Interceptor: No user found in localStorage.");
    }
    return config; // Return the config for the request to proceed
  },
  (error) => {
    console.error(">>> Interceptor: Request Error", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles 401 errors globally.
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.error("API Service: Received 401 Unauthorized. Token might be invalid or expired.");
      console.warn("API Service: Refresh token logic not implemented or failed. Forcing logout.");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent('auth-error-logout'));
    }
    return Promise.reject(error);
  }
);
export default apiService;