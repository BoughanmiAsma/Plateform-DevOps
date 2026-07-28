import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Deployments({ env }) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEnvFilter, setSelectedEnvFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getArgoCdDeployments();
        if (mounted) {
          // Trier par date décroissante (si reconciledAt existe)
          data.sort((a, b) => {
            if (!a.reconciledAt) return 1;
            if (!b.reconciledAt) return -1;
            return new Date(b.reconciledAt) - new Date(a.reconciledAt);
          });
          setDeployments(data);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      }
      if (mounted) setLoading(false);
    };

    loadData();
    // Refresh every 15s
    const interval = setInterval(loadData, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format date
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEnvClass = (ns) => {
    if (!ns) return 'env-dev';
    if (ns.includes('prod')) return 'env-prod';
    if (ns.includes('stg') || ns.includes('staging')) return 'env-stg';
    return 'env-dev';
  };

  const getEnvName = (ns) => {
    if (!ns) return 'Unknown';
    if (ns.includes('prod')) return 'PROD';
    if (ns.includes('stg') || ns.includes('staging')) return 'STG';
    if (ns.includes('dev')) return 'DEV';
    return ns.toUpperCase();
  };

  const getStatusColor = (status) => {
    if (!status) return '#94a3b8'; // Unknown
    const s = status.toLowerCase();
    if (s === 'synced' || s === 'healthy') return '#10b981'; // Green
    if (s === 'outofsync' || s === 'progressing') return '#f59e0b'; // Yellow
    if (s === 'degraded' || s === 'missing' || s === 'suspended') return '#ef4444'; // Red
    return '#6366f1';
  };

  // Appliquer les filtres
  const filteredDeployments = deployments.filter(d => {
    const targetNs = d.destinationNamespace || d.namespace;
    const dEnv = getEnvName(targetNs);
    // Filtre global (props env)
    if (env !== 'Global' && dEnv !== env) return false;
    // Filtre local de la page
    if (selectedEnvFilter !== 'All' && dEnv !== selectedEnvFilter) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="page-title-group">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ WebkitTextFillColor: 'initial', background: 'none' }}>🐙</span> ArgoCD Deployments
          </h1>
          <p className="page-subtitle">Track real Kubernetes releases and synchronization status.</p>
        </div>
        <button onClick={() => { setLoading(true); api.getArgoCdDeployments().then(setDeployments).finally(() => setLoading(false)) }} 
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px 22px', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.92rem', transition: 'transform 0.15s',
            display: 'flex', alignItems: 'center', gap: 8
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔄 Actualiser
        </button>
      </div>

      <div className="section-card">
        <div className="filters-row">
          <select
            value={selectedEnvFilter}
            onChange={(e) => setSelectedEnvFilter(e.target.value)}
            className="filter-select"
            disabled={env !== 'Global'}
          >
            <option value="All">All Environments</option>
            <option value="PROD">Production (PROD)</option>
            <option value="STG">Staging (STG)</option>
            <option value="DEV">Development (DEV)</option>
          </select>
        </div>

        {error && (
          <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 8, marginBottom: 16 }}>
            ⚠️ Erreur: {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Environment</th>
                <th>Sync Status</th>
                <th>Health Status</th>
                <th>Version (Revision)</th>
                <th>Last Synced</th>
              </tr>
            </thead>
            <tbody>
              {loading && deployments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    ⏳ Chargement des déploiements depuis ArgoCD...
                  </td>
                </tr>
              ) : filteredDeployments.map((dep) => {
                const targetNs = dep.destinationNamespace || dep.namespace;
                return (
                  <tr key={dep.uid || dep.name}>
                    <td>
                      <div className="project-meta">
                        <span className="project-name-cell" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {dep.name}
                        </span>
                        <span className="project-repo-cell">ns: {targetNs}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`env-badge ${getEnvClass(targetNs)}`}>
                        {getEnvName(targetNs)}
                      </span>
                    </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem',
                      fontWeight: 600, background: `${getStatusColor(dep.syncStatus)}20`, color: getStatusColor(dep.syncStatus)
                    }}>
                      {dep.syncStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem',
                      fontWeight: 600, background: `${getStatusColor(dep.healthStatus)}20`, color: getStatusColor(dep.healthStatus)
                    }}>
                      {dep.healthStatus}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {dep.revision ? dep.revision.substring(0, 7) : '—'}
                    </code>
                  </td>
                  <td>
                    {formatDate(dep.reconciledAt)}
                  </td>
                </tr>
              );
            })}

              {!loading && filteredDeployments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Aucun déploiement trouvé dans ArgoCD pour ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
