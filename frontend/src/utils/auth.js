/**
 * Authentication utility functions for JWT handling
 */

// Store the JWT token in localStorage
export const setToken = (token) => {
  localStorage.setItem("access_token", token)
}

// Store the refresh token in localStorage
export const setRefreshToken = (token) => {
  localStorage.setItem("refresh_token", token)
}

// Get the JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem("access_token")
}

// Get the refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token")
}

// Remove the JWT token from localStorage
export const removeToken = () => {
  localStorage.removeItem("access_token")
}

// Remove the refresh token from localStorage
export const removeRefreshToken = () => {
  localStorage.removeItem("refresh_token")
}

// Clear all auth tokens
export const clearTokens = () => {
  removeToken()
  removeRefreshToken()
}

// Parse the JWT token to get the payload
export const parseToken = (token) => {
  if (!token) return null

  try {
    // Split the token and get the payload part
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing token:", error)
    return null
  }
}

// Check if the token is expired
export const isTokenExpired = (token) => {
  const payload = parseToken(token)
  if (!payload) return true

  // Check if the token has an expiration time
  if (!payload.exp) return false

  // Convert exp to milliseconds and compare with current time
  const expirationTime = payload.exp * 1000
  return Date.now() >= expirationTime
}

// Check if the token will expire soon (within the next 5 minutes)
export const willTokenExpireSoon = (token, bufferTimeInSeconds = 300) => {
  const payload = parseToken(token)
  if (!payload) return true

  // Check if the token has an expiration time
  if (!payload.exp) return false

  // Convert exp to milliseconds and compare with current time + buffer
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  const bufferTime = bufferTimeInSeconds * 1000

  return currentTime + bufferTime >= expirationTime
}

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false

  return !isTokenExpired(token)
}

// Get the current user from the token
export const getCurrentUser = () => {
  const token = getToken()
  if (!token) return null

  const payload = parseToken(token)
  return payload
}
