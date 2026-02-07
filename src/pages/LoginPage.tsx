import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'
import ReactGA from "react-ga4";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const API_BASE_URL = import.meta.env.VITE_API_URL

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [loadingLocal, setLoadingLocal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleContinueWithOpenId = async () => {
    if (!CLIENT_ID) {
      setError('OpenID Client ID is not configured');
      return;
    }
    
    const ga = (ReactGA as any).default || ReactGA;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/auth/openid/url?t=${Date.now()}`);      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to get authorization URL');
      }

      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('No authorization URL returned from server');
      }
      ga.event({ category: "Auth", action: "login_openid_start" });
      
      window.location.href = data.authUrl;
    } catch (err: any) {
      ga.event({ category: "Auth", action: "login_openid_error", label: err.message });
      setError(err.message || 'Failed to initiate OpenID login');
    }
  }
  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingLocal(true)
    setError(null)

    try {
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login'
      const payload: Record<string, string> = { email, password }
      if (isRegisterMode && name) {
        payload.name = name
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        ReactGA.event({ 
          category: "Auth", 
          action: isRegisterMode ? "register_failed" : "login_failed",
          label: data.message 
        });
        throw new Error(data.message || `Failed to ${isRegisterMode ? 'register' : 'login'}`)
      }

      if (isRegisterMode) {
        ReactGA.event({ category: "Auth", action: "register_success" });
        setError(null)
        alert('Registration successful. Please login.')
        setIsRegisterMode(false)
        setEmail('')
        setPassword('')
        setName('')
        return
      }

      if (!data.token) {
        throw new Error('No token returned from server')
      }

      ReactGA.event({ category: "Auth", action: "login_local_success" });

      login(data.token)
      navigate('/')
    } catch (err: any) {
      console.error('Local auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoadingLocal(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginShell">
        <div className="loginHero">
          <div className="badge">Secure access</div>
          <h1 className="loginTitle">MindX Onboarding Portal</h1>
          <p className="loginSubtitle">
            Use your MindX account to access secure resources.
          </p>
          <div className="loginBullets">
            <div className="loginBullet"><span className="dot" /> Azure Cloud Infrastructure</div>
            <div className="loginBullet"><span className="dot" /> OpenID Authentication</div>
            <div className="loginBullet"><span className="dot" /> HTTPS Secure</div>
          </div>
        </div>

        <div className="loginCard panel">
          <div className="panelHeader">
            <div className="loginCardTitle">Login</div>
            <div className="loginCardSubtitle muted">Secure access to MindX Onboarding Portal</div>
          </div>
          <div className="panelBody">
            {error && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleContinueWithOpenId}
              className="btn btnPrimary loginButton"
              disabled={loadingLocal || !CLIENT_ID}
            >
              Continue with MindX OpenID
            </button>

            <div className="loginDivider">
              <span>or</span>
            </div>

            <form className="loginForm" onSubmit={handleLocalSubmit}>
              {isRegisterMode && (
                <div className="formGroup">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div className="formGroup">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input your email"
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Input your password"
                  required
                  minLength={isRegisterMode ? 8 : undefined}
                />
                {isRegisterMode && (
                  <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Password must be at least 8 characters
                  </small>
                )}
              </div>
              <button
                type="submit"
                className="btnPrimary loginButton"
                disabled={loadingLocal}
              >
                {loadingLocal
                  ? isRegisterMode
                    ? 'Registering...'
                    : 'Logging in...'
                  : isRegisterMode
                    ? 'Register'
                    : 'Login'}
              </button>

              <div className="loginToggle">
                {isRegisterMode ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="linkButton"
                      onClick={() => {
                        setIsRegisterMode(false)
                        setError(null)
                      }}
                    >
                      Login
                    </button>
                  </span>
                ) : (
                  <span>
                    Need an account?{' '}
                    <button
                      type="button"
                      className="linkButton"
                      onClick={() => {
                        setIsRegisterMode(true)
                        setError(null)
                      }}
                    >
                      Register
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
