"use client"

import { useAuth } from "../contexts/AuthContext"
import TokenRefreshDemo from "../components/TokenRefreshDemo"
import Navbar from "../components/shared/navbar"

const TokenDemoPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold mb-4">Token Refresh Demonstration</h1>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This page demonstrates the token refresh mechanism. The access token will automatically refresh when
                  it's about to expire (5 minutes before expiration). You can also manually refresh the token using the
                  button below.
                </p>
              </div>
            </div>
          </div>

          <TokenRefreshDemo />

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">How Token Refresh Works</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">The JWT Token Refresh Flow:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li className="text-sm text-gray-700">
                    When you log in, the server provides two tokens: a short-lived <strong>access token</strong> (15
                    minutes) and a longer-lived <strong>refresh token</strong> (7 (15 minutes) and a longer-lived{" "}
                    <strong>refresh token</strong> (7 days).
                  </li>
                  <li className="text-sm text-gray-700">
                    The access token is used for all authenticated API requests.
                  </li>
                  <li className="text-sm text-gray-700">
                    When the access token is about to expire (or has expired), the system uses the refresh token to
                    obtain a new access token without requiring the user to log in again.
                  </li>
                  <li className="text-sm text-gray-700">
                    The token refresh happens automatically in the background, providing a seamless user experience.
                  </li>
                  <li className="text-sm text-gray-700">If both tokens expire, the user will need to log in again.</li>
                </ol>

                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4 mb-2">Implementation Details:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="text-sm text-gray-700">
                    <strong>Token Storage:</strong> Both tokens are securely stored in localStorage.
                  </li>
                  <li className="text-sm text-gray-700">
                    <strong>Automatic Refresh:</strong> A timer is set to refresh the access token 5 minutes before it
                    expires.
                  </li>
                  <li className="text-sm text-gray-700">
                    <strong>API Interceptors:</strong> Axios interceptors automatically add the token to requests and
                    handle token refresh if a request fails due to an expired token.
                  </li>
                  <li className="text-sm text-gray-700">
                    <strong>Queue Management:</strong> If multiple requests fail due to an expired token, only one
                    refresh request is made, and all pending requests are queued and retried once the token is
                    refreshed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenDemoPage
