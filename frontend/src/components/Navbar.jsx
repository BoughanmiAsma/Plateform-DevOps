import React from 'react';

export default function Navbar({ env, setEnv, isLightMode, toggleTheme, unreadCount = 0, onOpenNotifications }) {
  return (
    <header className="navbar">
      <div className="nav-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search resources..."
          className="search-input"
        />
      </div>

      <div className="nav-actions">
        <select
          value={env}
          onChange={(e) => setEnv(e.target.value)}
          className="env-selector"
        >
          <option value="Global">Env: Global</option>
          <option value="PROD">Env: Production (PROD)</option>
          <option value="STG">Env: Staging (STG)</option>
          <option value="DEV">Env: Development (DEV)</option>
        </select>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="nav-btn"
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? '🌙' : '☀️'}
        </button>

        {/* Cloche notifications — dynamique */}
        <button
          className="nav-btn"
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
          onClick={onOpenNotifications}
          style={{ position: 'relative' }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 800,
              borderRadius: '999px',
              padding: '1px 5px',
              minWidth: '16px',
              textAlign: 'center',
              lineHeight: '14px',
              animation: 'pulse 2s infinite'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <button className="nav-btn" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
