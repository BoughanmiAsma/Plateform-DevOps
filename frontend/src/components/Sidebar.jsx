import React from 'react';

export default function Sidebar({ currentPage, setPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'platform' },
    { id: 'projects', label: 'Projects', icon: '📁', section: 'platform' },
    { id: 'deployments', label: 'Deployments', icon: '🚀', section: 'platform' },
    { id: 'monitoring', label: 'Monitoring', icon: '📈', section: 'observability' },
    { id: 'plugins', label: 'Plugins', icon: '🔌', section: 'observability' },
    { id: 'finops', label: 'FinOps & Coûts', icon: '💳', section: 'finops' },
    { id: 'observability-report', label: 'Rapport Observabilité', icon: '📄', section: 'reports' },
    { id: 'finops-report', label: 'Rapport FinOps', icon: '📊', section: 'reports' }
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
        <div className="sidebar-section-label">Platform</div>
        <div className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'platform')
            .map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Observability</div>
        <div className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'observability')
            .map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">FinOps</div>
        <div className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'finops')
            .map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Rapports</div>
        <div className="sidebar-menu">
          {menuItems
            .filter(item => item.section === 'reports')
            .map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          AC
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Alex Chen</div>
          <div className="sidebar-user-role">Lead DevOps</div>
        </div>
      </div>
    </aside>
  );
}
