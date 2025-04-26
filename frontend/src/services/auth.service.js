// frontend/src/services/auth.service.js
import apiService from './api';
const API_AUTH_URL = "/api/auth/";

const register = async (username, email, password, inviteCode) => {
  console.log(`AuthService: Attempting registration for user: ${username}`);
  try {
    const response = await apiService.post(API_AUTH_URL + "signup", {
      username,
      email,
      password,
      inviteCode
    });
    console.log("AuthService: Registration Response Status:", response.status);
    console.log("AuthService: Registration Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("AuthService: Registration API error caught:", error.response?.data || error.message || error);
    // Re-throw a more specific error if possible
    throw new Error(error.response?.data?.message || error.message || "Registration failed.");
  }
};

const login = async (username, password) => {
  console.log(`AuthService: Attempting login for user: ${username}`);
  try {
    const response = await apiService.post(API_AUTH_URL + "signin", { username, password });
    console.log("AuthService: API Response Status:", response.status);
    console.log("AuthService: API Response Data:", response.data);

    // IMPORTANT: Check specifically for the presence of the token AND a 2xx status
    // Axios throws for non-2xx, so this check is mainly for unexpected 200 responses without a token
    if (response.status >= 200 && response.status < 300 && response.data && response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("AuthService: Login successful, user data stored.");
      return response.data; // Return user data on actual success
    } else {
      // This case handles scenarios where the API might return 200 OK but without a token,
      // OR if the status check was somehow bypassed (less likely with standard Axios).
      console.warn("AuthService: Login response indicates failure or missing token.", response.data);
      localStorage.removeItem("user"); // Ensure no partial data is stored
      // Throw an error to be caught by AuthContext/LoginPage
      throw new Error(response.data?.message || "Login failed: Invalid response from server.");
    }
  } catch (error) {
    // This block catches Axios errors (like 401, 404, 500) or the error thrown above
    const errorMessage = error.response?.data?.message || error.message || "Login request failed.";
    console.error("AuthService: Login API error caught:", errorMessage, error.response?.status); // Log status too
    localStorage.removeItem("user"); // Ensure storage is clear on any error
    // Re-throw the error so AuthContext and LoginPage can handle it
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem("user");
  console.log("Auth Service: User data removed from localStorage (logout).");
};

const getCurrentUser = () => {
   try {
    const userString = localStorage.getItem("user");
    if (!userString) return null;
    return JSON.parse(userString);
  } catch (error) {
    console.error("Auth Service: Error parsing current user from localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default AuthService;
