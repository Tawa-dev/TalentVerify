import axios from "axios"
import { getToken, getRefreshToken, setToken } from "./auth"
import { refreshAccessToken } from "../api/authApi"

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

const refreshToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        resolve(newToken)
      })
    })
  }

  isRefreshing = true

  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await refreshAccessToken(refreshToken)
    const newAccessToken = response.accessToken

    setToken(newAccessToken)
    onTokenRefreshed(newAccessToken)

    isRefreshing = false
    return newAccessToken
  } catch (error) {
    isRefreshing = false
    console.error("Token refresh failed:", error)
    window.location.href = "/login"
    return null
  }
}

// Simplified request interceptor - removed proactive token refresh
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - only refresh on 401 errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Skip token refresh for auth endpoints
    const isAuthEndpoint =
      originalRequest.url.includes('/token/') ||
      originalRequest.url.includes('/login/')

    // Only refresh token on 401 errors for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const newToken = await refreshToken()
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api