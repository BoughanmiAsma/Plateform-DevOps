import React from 'react';

export default function Navbar({ env, setEnv, isLightMode, toggleTheme }) {
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

        <button className="nav-btn" title="Notifications">
          🔔
          <span className="badge-dot"></span>
        </button>

        <button className="nav-btn" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
