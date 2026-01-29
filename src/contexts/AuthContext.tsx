import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

interface User {
  sub: string
  email?: string
  name?: string
  auth_type?: 'local' | 'openid'
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  const fetchUserInfo = useCallback(async (authToken: string) => {
    try {
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      
      if (response.data && response.data.user) {
        setUser(response.data.user)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Failed to fetch user info:', error)
      
      // If 401 or 403, token is invalid
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear invalid token
        setToken(null)
        setUser(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      }
      
      throw error
    }
  }, [])

  useEffect(() => {
    // Check if user is authenticated on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUserInfo(storedToken)
        .catch(() => {
          // Error already handled in fetchUserInfo
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [fetchUserInfo])

  const login = useCallback((authToken: string) => {
    if (!authToken) {
      console.error('Login called with empty token')
      return
    }

    setToken(authToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authToken)
    }
    
    // Fetch user info
    fetchUserInfo(authToken)
      .catch((error) => {
        console.error('Failed to fetch user info after login:', error)
        // Don't clear token here, let the error be handled by the component
      })
  }, [fetchUserInfo])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
