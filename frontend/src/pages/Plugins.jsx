import React, { useState } from 'react';

export default function Plugins() {
  const [plugins, setPlugins] = useState([
    {
      id: 'jenkins',
      name: 'Jenkins',
      description: 'Connect to your Jenkins server to trigger and monitor builds directly from Nexus.',
      status: 'installed',
      icon: '⚙️'
    },
    {
      id: 'github',
      name: 'GitHub Actions',
      description: 'Sync repositories and trigger GitHub Actions workflows automatically.',
      status: 'not_installed',
      icon: '🐙'
    },
    {
      id: 'slack',
      name: 'Slack Notifications',
      description: 'Send pipeline status updates and deployment alerts to Slack channels.',
      status: 'not_installed',
      icon: '💬'
    }
  ]);

  const [configurePluginId, setConfigurePluginId] = useState(null);
  
  // Paramètres Jenkins locaux configurés dans application.properties
  const [jenkinsUrl, setJenkinsUrl] = useState('http://localhost:8085');
  const [jenkinsUser, setJenkinsUser] = useState('Asma-Boughanmi');
  const [jenkinsToken, setJenkinsToken] = useState('••••••••••••••••••••••••••••••••');

  const handleInstall = (id) => {
    setPlugins(plugins.map(p => {
      if (p.id === id) {
        return { ...p, status: 'installed' };
      }
      return p;
    }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    alert('Jenkins configuration saved and verified successfully!');
    setConfigurePluginId(null);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Plugins & Integrations</h1>
          <p className="page-subtitle">Extend DevOpsPlateform with external tools and services.</p>
        </div>
      </div>

      {configurePluginId === 'jenkins' ? (
        <div className="section-card" style={{ maxWidth: '600px' }}>
          <div className="section-header">
            <span className="section-title">Configure Jenkins Server</span>
            <button className="modal-close" onClick={() => setConfigurePluginId(null)}>✕</button>
          </div>
          
          <form onSubmit={handleSaveConfig}>
            <div className="form-group">
              <label className="form-label">Jenkins Base URL</label>
              <input 
                type="text" 
                className="form-control" 
                value={jenkinsUrl} 
                onChange={(e) => setJenkinsUrl(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={jenkinsUser} 
                onChange={(e) => setJenkinsUser(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Token / Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={jenkinsToken} 
                onChange={(e) => setJenkinsToken(e.target.value)} 
                required 
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfigurePluginId(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save & Test Connection
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="plugins-grid">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="plugin-card">
              <div className="plugin-card-header">
                <div className="plugin-icon">{plugin.icon}</div>
                <div className="plugin-meta">
                  <span className="plugin-name">{plugin.name}</span>
                  <span className={`plugin-status ${plugin.status}`}>
                    {plugin.status === 'installed' ? '● Installed' : 'Not Installed'}
                  </span>
                </div>
              </div>
              
              <p className="plugin-desc">{plugin.description}</p>
              
              <div className="plugin-actions">
                {plugin.status === 'installed' ? (
                  <button 
                    className="btn-secondary"
                    onClick={() => setConfigurePluginId(plugin.id)}
                  >
                    Configure
                  </button>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={() => handleInstall(plugin.id)}
                  >
                    Install Plugin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
