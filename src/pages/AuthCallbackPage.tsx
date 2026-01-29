import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (errorParam) {
        setError(errorDescription || errorParam || 'Authentication failed')
        setLoading(false)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        return
      }

      if (!token) {
        setError('No token received')
        setLoading(false)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        return
      }

      try {
        login(token)
        navigate('/')
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        setLoading(false)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, login])

  if (loading) {
    return (
      <div className="loginPage">
        <div className="loginShell">
          <div className="loginCard panel">
            <div className="panelBody" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>Processing authentication...</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Please wait</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loginPage">
        <div className="loginShell">
          <div className="loginCard panel">
            <div className="panelBody" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem', color: '#d32f2f' }}>Authentication Error</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                {error}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                Redirecting to login page...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallbackPage
