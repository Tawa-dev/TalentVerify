"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getToken, parseToken } from "../utils/auth"

// This component demonstrates the token refresh mechanism
const TokenRefreshDemo = () => {
  const { refreshToken } = useAuth()
  const [tokenInfo, setTokenInfo] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Update token info every second
  useEffect(() => {
    const updateTokenInfo = () => {
      const token = getToken()
      if (token) {
        const payload = parseToken(token)
        if (payload) {
          const expiresAt = new Date(payload.exp * 1000).toLocaleTimeString()
          const now = new Date().toLocaleTimeString()
          const timeLeft = Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000))

          setTokenInfo({
            username: payload.username,
            role: payload.role,
            expiresAt,
            now,
            timeLeft,
          })
        }
      } else {
        setTokenInfo(null)
      }
    }

    // Update immediately and then every second
    updateTokenInfo()
    const interval = setInterval(updateTokenInfo, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle manual token refresh
  const handleRefreshToken = async () => {
    setRefreshing(true)
    setError(null)

    try {
      await refreshToken()
    } catch (err) {
      setError(err.message || "Failed to refresh token")
    } finally {
      setRefreshing(false)
    }
  }

  if (!tokenInfo) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">No active token found. Please log in.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Token Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">This demonstrates the token refresh mechanism.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenInfo.username}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenInfo.role}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current time</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenInfo.now}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Token expires at</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tokenInfo.expiresAt}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Time until expiration</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tokenInfo.timeLeft > 0 ? (
                <span className={tokenInfo.timeLeft < 300 ? "text-red-600 font-bold" : ""}>
                  {Math.floor(tokenInfo.timeLeft / 60)}m {tokenInfo.timeLeft % 60}s
                  {tokenInfo.timeLeft < 300 && " (Token will refresh soon)"}
                </span>
              ) : (
                <span className="text-red-600 font-bold">Expired</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button
          onClick={handleRefreshToken}
          disabled={refreshing}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {refreshing ? "Refreshing..." : "Refresh Token Now"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Note: In this demo, access tokens expire after 15 minutes and refresh tokens after 7 days. The system will
          automatically refresh the access token when it's about to expire.
        </p>
      </div>
    </div>
  )
}

export default TokenRefreshDemo
