import React from 'react';

export default function Sidebar({ currentPage, setPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'platform' },
    { id: 'projects', label: 'Projects', icon: '📁', section: 'platform' },
    { id: 'deployments', label: 'Deployments', icon: '🚀', section: 'platform' },
    { id: 'monitoring', label: 'Monitoring', icon: '📈', section: 'observability' },
    { id: 'plugins', label: 'Plugins', icon: '🔌', section: 'observability' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span style={{ fontSize: '1.2rem', color: '#fff' }}>⚛️</span>
        </div>
        <span className="logo-text">DevOpsPlateform</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Platform</div>
        <ul className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'platform')
            .map(item => (
              <li key={item.id} className="sidebar-item">
                <a
                  className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Observability</div>
        <ul className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'observability')
            .map(item => (
              <li key={item.id} className="sidebar-item">
                <a
                  className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
        </ul>
      </div>

      <div className="sidebar-user">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
          alt="Alex Chen"
          className="avatar"
        />
        <div className="user-info">
          <span className="user-name">Alex Chen</span>
          <span className="user-role">Lead DevOps</span>
        </div>
      </div>
    </aside>
  );
}
