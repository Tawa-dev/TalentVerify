import { createContext, useContext, useState, useEffect } from 'react'
import { api, setRefreshTokenHandler } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh')
      if (!refresh) return null
      
      const { data } = await api.post('/auth/refresh/', { refresh })
      localStorage.setItem('access', data.access)
      return data.access
    } catch (error) {
      logout()
      return null
    }
  }

  // Register refresh token handler with API client
  useEffect(() => {
    setRefreshTokenHandler(refreshToken)
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login/', { email, password })
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      
      const userResponse = await api.get('/user/')
      setUser(userResponse.data)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const value = { user, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)