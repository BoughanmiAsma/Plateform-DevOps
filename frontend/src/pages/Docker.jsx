import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TABS = [
  { id: 'containers', label: 'Containers', icon: '📦' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'volumes', label: 'Volumes', icon: '💾' },
  { id: 'networks', label: 'Networks', icon: '🌐' },
];

export default function Docker() {
  const [tab, setTab] = useState('containers');
  const [containers, setContainers] = useState([]);
  const [images, setImages] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [pullInput, setPullInput] = useState('');
  const [pullLoading, setPullLoading] = useState(false);

  // Panel logs
  const [logsPanel, setLogsPanel] = useState(null); // { id, name, logs }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'containers') {
        const data = await api.getDockerContainers(true);
        setContainers(data);
      } else if (tab === 'images') {
        const data = await api.getDockerImages();
        setImages(data);
      } else if (tab === 'volumes') {
        const data = await api.getDockerVolumes();
        setVolumes(data);
      } else if (tab === 'networks') {
        const data = await api.getDockerNetworks();
        setNetworks(data);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données Docker');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Actions container
  const doAction = async (actionFn, containerId, name) => {
    setActionLoading(containerId);
    try {
      await actionFn(containerId);
      await loadData();
    } catch (err) {
      alert(`Erreur pour ${name || containerId}: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContainer = async (containerId, name) => {
    if (!window.confirm(`Voulez-vous vraiment SUPPRIMER le container "${name}" ?`)) return;
    setActionLoading(containerId);
    try {
      await api.deleteDockerContainer(containerId, true);
      await loadData();
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveImage = async (imageId, tag) => {
    if (!window.confirm(`Voulez-vous vraiment SUPPRIMER l'image "${tag || imageId}" ?`)) return;
    setActionLoading(imageId);
    try {
      await api.deleteDockerImage(imageId, true);
      await loadData();
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePull = async () => {
    if (!pullInput.trim()) return;
    setPullLoading(true);
    try {
      await api.pullDockerImage(pullInput.trim());
      setPullInput('');
      await loadData();
    } catch (err) {
      alert(`Erreur lors du pull de l'image: ${err.message}`);
    } finally {
      setPullLoading(false);
    }
  };

  const openLogs = async (containerId, name) => {
    try {
      const logs = await api.getDockerContainerLogs(containerId, 200);
      setLogsPanel({ id: containerId, name, logs });
    } catch (err) {
      alert(`Erreur logs: ${err.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  const timeAgo = (timestampSec) => {
    if (!timestampSec) return '—';
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestampSec;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const stateColor = (state) => {
    switch (state) {
      case 'running': return '#10b981';
      case 'exited': return '#ef4444';
      case 'paused': return '#f59e0b';
      default: return '#64748b';
    }
  };

  // Filtrage local
  const filteredContainers = containers.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      (c.names && c.names.some(n => n.toLowerCase().includes(q))) ||
      (c.image && c.image.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q));
  });

  const filteredImages = images.filter(img => {
    const q = search.toLowerCase();
    return !q ||
      (img.repoTags && img.repoTags.some(t => t.toLowerCase().includes(q))) ||
      (img.id && img.id.toLowerCase().includes(q));
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="page-title-group">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ WebkitTextFillColor: 'initial', background: 'none' }}>🐳</span> Docker Desktop
          </h1>
          <p className="page-subtitle">
            Centralisez la gestion de vos containers, images, volumes et réseaux Docker.
          </p>
        </div>
        <button onClick={loadData}
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
        {/* Row avec Tabs et Barre de recherche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)', borderRadius: 12, padding: 4
          }}>
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => { setTab(t.id); setSearch(''); }}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                  background: tab === t.id ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          {(tab === 'containers' || tab === 'images') && (
            <input
              type="text" placeholder={`🔍 Rechercher un ${tab === 'containers' ? 'container' : 'image'}...`}
              value={search} onChange={e => setSearch(e.target.value)}
              className="filter-select"
              style={{ minWidth: 260 }}
            />
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 10, padding: '12px 16px', color: '#ef4444', marginBottom: 16, fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
            Chargement...
          </div>
        ) : (
          <>
            {/* ==================== CONTAINERS TAB ==================== */}
            {tab === 'containers' && (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Container</th>
                      <th>Image</th>
                      <th style={{ textAlign: 'center' }}>État</th>
                      <th>Ports</th>
                      <th>Créé</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContainers.map(c => (
                      <tr key={c.idFull}>
                        <td>
                          <div className="project-meta">
                            <span className="project-name-cell">{c.names ? c.names[0] : c.id}</span>
                            <span className="project-repo-cell">{c.id}</span>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {c.image}
                          </code>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                            background: `${stateColor(c.state)}20`, color: stateColor(c.state)
                          }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: '50%', background: stateColor(c.state),
                              boxShadow: c.state === 'running' ? `0 0 8px ${stateColor(c.state)}` : 'none'
                            }}></span>
                            {c.state}
                          </span>
                        </td>
                        <td>
                          {c.ports && c.ports.length > 0 ? c.ports.map((p, i) => {
                            const isPublic = !!p.publicPort;
                            const PortComponent = isPublic ? 'a' : 'span';
                            const props = isPublic ? {
                              href: `http://localhost:${p.publicPort}`,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              title: `Ouvrir http://localhost:${p.publicPort}`
                            } : {};

                            return (
                              <PortComponent key={i} {...props} style={{
                                display: 'inline-block', background: isPublic ? 'rgba(59,130,246,0.18)' : 'var(--bg-tertiary)',
                                color: isPublic ? '#3b82f6' : 'var(--text-secondary)', borderRadius: 6, padding: '2px 8px', marginRight: 4,
                                fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none',
                                cursor: isPublic ? 'pointer' : 'default',
                                border: isPublic ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { if (isPublic) e.currentTarget.style.background = 'rgba(59,130,246,0.3)'; }}
                              onMouseOut={e => { if (isPublic) e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; }}
                              >
                                {p.publicPort ? `${p.publicPort}→${p.privatePort}` : p.privatePort}
                              </PortComponent>
                            );
                          }) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {timeAgo(c.created)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {c.state !== 'running' && (
                              <ActionBtn label="▶" title="Start" color="#10b981"
                                loading={actionLoading === c.idFull}
                                onClick={() => doAction(api.startDockerContainer, c.idFull, c.names?.[0])} />
                            )}
                            {c.state === 'running' && (
                              <ActionBtn label="⏹" title="Stop" color="#ef4444"
                                loading={actionLoading === c.idFull}
                                onClick={() => doAction(api.stopDockerContainer, c.idFull, c.names?.[0])} />
                            )}
                            <ActionBtn label="🔄" title="Restart" color="#f59e0b"
                              loading={actionLoading === c.idFull}
                              onClick={() => doAction(api.restartDockerContainer, c.idFull, c.names?.[0])} />
                            <ActionBtn label="📋" title="Logs" color="#3b82f6"
                              onClick={() => openLogs(c.idFull, c.names?.[0] || c.id)} />
                            <ActionBtn label="🗑" title="Supprimer" color="#ef4444"
                              loading={actionLoading === c.idFull}
                              onClick={() => handleRemoveContainer(c.idFull, c.names?.[0] || c.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredContainers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Aucun container trouvé.
                  </div>
                )}
              </div>
            )}

            {/* ==================== IMAGES TAB ==================== */}
            {tab === 'images' && (
              <div className="table-responsive">
                {/* Pull image bar */}
                <div style={{
                  display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap'
                }}>
                  <input type="text" placeholder="Ex: nginx:latest, redis:7-alpine..."
                    value={pullInput} onChange={e => setPullInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePull()}
                    className="filter-select"
                    style={{ flex: 1, minWidth: 250 }}
                  />
                  <button onClick={handlePull} disabled={pullLoading || !pullInput.trim()}
                    style={{
                      background: pullLoading ? 'var(--text-muted)' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px',
                      cursor: pullLoading ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem'
                    }}>
                    {pullLoading ? '⏳ Pull en cours...' : '⬇️ Pull Image'}
                  </button>
                </div>

                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Repository : Tag</th>
                      <th>ID</th>
                      <th style={{ textAlign: 'right' }}>Taille</th>
                      <th>Créé</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImages.map(img => (
                      <tr key={img.idFull}>
                        <td>
                          {img.repoTags?.map((tag, i) => (
                            <span key={i} style={{
                              display: 'inline-block', background: 'rgba(99,102,241,0.12)',
                              color: 'var(--accent-primary)', borderRadius: 6, padding: '3px 10px', marginRight: 6,
                              fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600
                            }}>{tag}</span>
                          ))}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {img.id}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                          {formatBytes(img.size)}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {timeAgo(img.created)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <ActionBtn label="🗑" title="Supprimer" color="#ef4444"
                            loading={actionLoading === img.id}
                            onClick={() => handleRemoveImage(img.id, img.repoTags?.[0] || img.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredImages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Aucune image trouvée.</div>
                )}
              </div>
            )}

            {/* ==================== VOLUMES TAB ==================== */}
            {tab === 'volumes' && (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Driver</th>
                      <th>Mountpoint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volumes.map(v => (
                      <tr key={v.name}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          💾 {v.name?.length > 30 ? v.name.substring(0, 30) + '...' : v.name}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{v.driver}</td>
                        <td style={{
                          fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem'
                        }}>{v.mountpoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==================== NETWORKS TAB ==================== */}
            {tab === 'networks' && (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Driver</th>
                      <th>Scope</th>
                      <th>Containers connectés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networks.map(n => (
                      <tr key={n.idFull}>
                        <td>
                          <div className="project-meta">
                            <span className="project-name-cell">🌐 {n.name}</span>
                            <span className="project-repo-cell">{n.id}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                            borderRadius: 6, padding: '3px 10px', fontSize: '0.82rem', fontWeight: 600
                          }}>{n.driver}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{n.scope}</td>
                        <td>
                          {n.containers && n.containers.length > 0 ? n.containers.map((ct, i) => (
                            <span key={i} style={{
                              display: 'inline-block', background: 'rgba(16,185,129,0.12)',
                              color: '#10b981', borderRadius: 6, padding: '2px 8px', marginRight: 6,
                              fontSize: '0.78rem', marginBottom: 2, fontWeight: 600
                            }}>
                              {ct.name}
                            </span>
                          )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== LOGS PANEL ==================== */}
      {logsPanel && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '50vw', minWidth: 400, height: '100vh',
          background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)', animation: 'slideIn 0.25s ease-out'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📋 Logs : {logsPanel.name}</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{logsPanel.id}</span>
            </div>
            <button onClick={() => setLogsPanel(null)} style={{
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600
            }}>✕ Fermer</button>
          </div>
          <pre style={{
            flex: 1, overflow: 'auto', padding: 20, margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem',
            lineHeight: 1.6, color: '#94a3b8', background: '#0f172a',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {logsPanel.logs}
          </pre>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ActionBtn({ label, title, color, onClick, loading }) {
  return (
    <button title={title} onClick={onClick} disabled={loading}
      style={{
        background: `${color}18`, color, border: `1px solid ${color}40`,
        borderRadius: 8, padding: '6px 10px', cursor: loading ? 'wait' : 'pointer',
        fontSize: '0.85rem', transition: 'all 0.15s', opacity: loading ? 0.5 : 1
      }}
      onMouseOver={e => { if (!loading) e.currentTarget.style.background = `${color}30`; }}
      onMouseOut={e => { e.currentTarget.style.background = `${color}18`; }}
    >
      {label}
    </button>
  );
}
