import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth()

  const displayName =
    (user as any)?.full_name ||
    (user as any)?.fullName ||
    user?.name ||
    (user as any)?.preferred_username ||
    'User'

  const displayEmail = user?.email || ''

  const initials = (() => {
    const fromName = String(displayName || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
    if (fromName) return fromName
    if (displayEmail) return displayEmail.slice(0, 2).toUpperCase()
    return 'U'
  })()

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandText">
              <div className="brandTitle">MindX Onboarding Portal</div>
              <div className="brandSubtitle">Week 1</div>
            </div>
          </div>

          <div className="topbarCenter" aria-hidden={!isAuthenticated}>
            {isAuthenticated && (
              <div className="searchShell">
                <div className="searchIcon" aria-hidden="true" />
                <input
                  className="searchInput"
                  placeholder="Search"
                  disabled
                  value=""
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="topbarRight">
            {isAuthenticated && (
              <div className="userBlock">
                <div className="avatar" aria-label="User avatar">
                  {initials}
                </div>
                <div className="userMeta">
                  <div className="userName">{displayName}</div>
                  <div className="userEmail">{displayEmail}</div>
                </div>
                <button onClick={logout} className="btn btnGhost" title="Logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}

export default Layout
