import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './HomePage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const HomePage = () => {
  const { user, token } = useAuth()
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [testData, setTestData] = useState<any>(null)
  const [authApiData, setAuthApiData] = useState<any>(null)

  useEffect(() => {
    // Test API connection
    checkApiHealth()
    fetchTestData()
    fetchAuthMe()
  }, [])

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`)
      setApiStatus(`API is healthy - ${response.data.status}`)
    } catch (error) {
      setApiStatus('API connection failed')
      console.error('Health check error:', error)
    }
  }

  const fetchTestData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setTestData(response.data)
    } catch (error) {
      console.error('Test API error:', error)
    }
  }

  const fetchAuthMe = async () => {
    if (!token) return
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setAuthApiData(response.data)
    } catch (error) {
      console.error('/auth/me error:', error)
      setAuthApiData(null)
    }
  }

  return (
    <div className="home">
      <div className="homeHeader">
        <div>
          <div className="badge">Protected</div>
          <h1 className="homeTitle">Dashboard</h1>
          <p className="homeSubtitle muted">
            Authenticated UI with API access through <span className="code">/api</span>.
          </p>
        </div>
        <div className="homeActions">
          <button className="btn" onClick={() => { checkApiHealth(); fetchTestData(); }}>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="panelHeader">
            <div className="sectionTitle">User</div>
            <div className="sectionSub muted">Token subject & profile claims</div>
          </div>
          <div className="panelBody">
            <div className="kv">
              <div className="k">sub</div>
              <div className="v code">{user?.sub || 'N/A'}</div>
            </div>
            <div className="kv">
              <div className="k">email</div>
              <div className="v">{user?.email || 'N/A'}</div>
            </div>
            <div className="kv">
              <div className="k">name</div>
              <div className="v">{user?.name || 'N/A'}</div>
            </div>
            {authApiData && (
              <div className="kv">
                <div className="k">auth source</div>
                <div className="v">
                  {(authApiData.user as any)?.auth_type === 'local'
                    ? 'Local (email/password)'
                    : 'OpenID'}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div className="sectionTitle">API status</div>
            <div className="sectionSub muted">Ingress routes</div>
          </div>
          <div className="panelBody">
            <div className="statusRow">
              <span className="statusDot" />
              <span>{apiStatus}</span>
            </div>
            <div className="routes code">
              <div>GET /health</div>
              <div>GET /api/test</div>
              <div>GET /api/auth/me (Bearer)</div>
            </div>
          </div>
        </section>
      </div>

      {testData && (
        <section className="panel homeWide">
          <div className="panelHeader">
            <div className="sectionTitle">Latest response</div>
            <div className="sectionSub muted">GET /api/test</div>
          </div>
          <div className="panelBody">
            <pre className="json">{JSON.stringify(testData, null, 2)}</pre>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
