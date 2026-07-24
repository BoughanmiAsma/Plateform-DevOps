import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

export default function Sidebar({ currentPage, setPage }) {
  const { keycloak } = useKeycloak();
  
  const firstName = keycloak?.tokenParsed?.given_name || '';
  const lastName = keycloak?.tokenParsed?.family_name || '';
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (keycloak?.tokenParsed?.preferred_username || 'Utilisateur');
  const userInitials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : fullName.substring(0, 2).toUpperCase();
  const userRole = keycloak?.tokenParsed?.realm_access?.roles?.includes('manager') ? 'Manager' : 'DevOps';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'platform' },
    { id: 'projects', label: 'Projects', icon: '📁', section: 'platform' },
    { id: 'deployments', label: 'Deployments', icon: '🚀', section: 'platform' },
    { id: 'monitoring', label: 'Monitoring', icon: '📈', section: 'observability' },
    { id: 'plugins', label: 'Plugins', icon: '🔌', section: 'observability' },
    { id: 'finops', label: 'FinOps & Coûts', icon: '💳', section: 'finops' }
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

      <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => keycloak.logout()}>
        <div className="sidebar-avatar" title="Se déconnecter">
          {userInitials}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" title={fullName}>{fullName}</div>
          <div className="sidebar-user-role">{userRole}</div>
        </div>
      </div>
    </aside>
  );
}
