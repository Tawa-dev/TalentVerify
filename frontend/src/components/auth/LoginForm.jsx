"use client"

import { useState } from "react"
import { LockClosedIcon } from "@heroicons/react/24/solid"

// Sample user data for demonstration
const SAMPLE_USERS = [
  { id: 1, username: "company_user", password: "password", name: "Company Admin", role: "company" },
  { id: 2, username: "verify_staff", password: "password", name: "Verification Staff", role: "verification" },
  { id: 3, username: "general_user", password: "password", name: "General User", role: "general" },
]

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // In a real application, this would be an API call to your authentication service
    const user = SAMPLE_USERS.find((user) => user.username === username && user.password === password)

    if (user) {
      // Successful login
      onLogin(user)
    } else {
      // Failed login
      setError("Invalid username or password")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Talent Verify</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access the talent verification system</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400" aria-hidden="true" />
              </span>
              Sign in
            </button>
          </div>

          <div className="text-sm text-center">
            <p className="font-medium text-emerald-600 hover:text-emerald-500">Demo accounts:</p>
            <p className="text-gray-500">company_user / password</p>
            <p className="text-gray-500">verify_staff / password</p>
            <p className="text-gray-500">general_user / password</p>
          </div>
        </form>
      </div>
    </div>
  )
}
