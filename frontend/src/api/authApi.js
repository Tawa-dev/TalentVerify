import api from "../utils/axiosConfig";

// Register function
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData)
    return response.data
  } catch (error) {
    throw error
  }
} 

// Login function
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/token/', { email, password });
    console.log("Login response data:", response.data);
    
    return {
      user: response.data.user,
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.response?.data?.detail || "Invalid email or password");
  }
}

// Refresh the access token
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await api.post('/users/token/refresh/', { refresh: refreshToken });
    return {
      accessToken: response.data.access,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error("Invalid refresh token");
  }
}

// Get the current user from the API
export const getCurrentUser = async (token) => {
  try {
    const response = await api.get('/users/me/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Current user data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw new Error("Failed to get current user");
  }
}