import { createContext, useState, useEffect, useContext, useCallback } from "react"
import {
  setToken,
  setRefreshToken,
  getToken,
  getRefreshToken,
  clearTokens,
  parseToken,
  isTokenExpired,
  willTokenExpireSoon,
} from "../utils/auth"
import { login as apiLogin, refreshAccessToken, getCurrentUser, registerUser } from "../api/authApi"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null)

  // Optimized refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await refreshAccessToken(refreshToken)
      setToken(response.accessToken)
      setupTokenRefresh()
      return response.accessToken
    } catch (err) {
      console.error("Token refresh failed:", err)
      clearTokens()
      setUser(null)
      throw err
    }
  }, [])

  const setupTokenRefresh = useCallback(() => {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer)
    }

    const token = getToken()
    if (!token || isTokenExpired(token)) return

    try {
      const payload = parseToken(token)
      if (!payload || !payload.exp) return

      const expiresAt = payload.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0)

      const timerId = setTimeout(() => {
        refreshToken().catch((err) => console.error("Failed to refresh token:", err))
      }, refreshTime)

      setTokenRefreshTimer(timerId)
    } catch (err) {
      console.error("Error setting up token refresh:", err)
    }
  }, [tokenRefreshTimer, refreshToken])

  // Simplified initialization - no unnecessary API calls
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken()
        if (token && !isTokenExpired(token)) {
          // Extract user data from token payload to avoid API call
          const payload = parseToken(token)
          if (payload) {
            // Set temporary user data from token
            setUser({
              id: payload.user_id || payload.sub,
              email: payload.email,
              role: payload.role,
              // Add other fields as needed
            })
            
            // Set up token refresh
            setupTokenRefresh()
            
            // Fetch full user data in background (non-blocking)
            getCurrentUser(token)
              .then(fullUserData => setUser(fullUserData))
              .catch(err => console.warn("Failed to fetch full user data:", err))
          }
        } else {
          // Token is expired or doesn't exist
          clearTokens()
          setUser(null)
        }
      } catch (err) {
        console.error("Authentication initialization error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer)
      }
    }
  }, []) // Remove dependencies to prevent re-runs

  // Optimized login function
  const login = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const data = await apiLogin(email, password)

      // Store tokens
      setToken(data.accessToken)
      setRefreshToken(data.refreshToken)

      // Set user immediately from login response
      setUser(data.user)

      // Set up token refresh
      setupTokenRefresh()

      return data.user
    } catch (err) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // New register function that handles the full registration flow
  const register = async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const data = await registerUser(userData)

      // Store tokens from registration response
      setToken(data.access)
      setRefreshToken(data.refresh)

      // Set user from registration response
      setUser(data.user)

      // Set up token refresh
      setupTokenRefresh()

      return data.user
    } catch (err) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer)
      setTokenRefreshTimer(null)
    }
    clearTokens()
    setUser(null)
  }


  const hasRole = (role) => {
    if (!user) return false
    return user.role === role
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}