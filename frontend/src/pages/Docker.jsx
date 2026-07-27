import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TABS = [
  { id: 'containers', label: 'Containers', icon: '📦' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'volumes', label: 'Volumes', icon: '💾' },
  { id: 'networks', label: 'Networks', icon: '🌐' }
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(epoch) {
  if (!epoch) return '—';
  const seconds = Math.floor(Date.now() / 1000 - epoch);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Docker() {
  const [tab, setTab] = useState('containers');
  const [containers, setContainers] = useState([]);
  const [images, setImages] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [logsPanel, setLogsPanel] = useState(null); // { id, name, logs }
  const [pullInput, setPullInput] = useState('');
  const [pullLoading, setPullLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'containers') setContainers(await api.getDockerContainers(true));
      else if (tab === 'images') setImages(await api.getDockerImages());
      else if (tab === 'volumes') setVolumes(await api.getDockerVolumes());
      else if (tab === 'networks') setNetworks(await api.getDockerNetworks());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  // Polling every 10s for containers
  useEffect(() => {
    if (tab !== 'containers') return;
    const interval = setInterval(() => {
      api.getDockerContainers(true).then(setContainers).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [tab]);

  const doAction = async (action, id, name) => {
    setActionLoading(id);
    try {
      await action(id);
      await loadData();
    } catch (err) {
      setError(`Erreur sur ${name}: ${err.message}`);
    }
    setActionLoading('');
  };

  const openLogs = async (id, name) => {
    try {
      const data = await api.getDockerContainerLogs(id, 150);
      setLogsPanel({ id, name, logs: data.logs || 'Aucun log disponible.' });
    } catch (err) {
      setError(`Erreur logs: ${err.message}`);
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
      setError(`Erreur pull: ${err.message}`);
    }
    setPullLoading(false);
  };

  const handleRemoveContainer = async (id, name) => {
    if (!window.confirm(`Supprimer le container "${name}" ?`)) return;
    await doAction((cid) => api.removeDockerContainer(cid, true), id, name);
  };

  const handleRemoveImage = async (id, tag) => {
    if (!window.confirm(`Supprimer l'image "${tag}" ?`)) return;
    setActionLoading(id);
    try {
      await api.removeDockerImage(id, true);
      await loadData();
    } catch (err) {
      setError(`Erreur suppression image: ${err.message}`);
    }
    setActionLoading('');
  };

  const stateColor = (state) => {
    if (state === 'running') return '#4ade80';
    if (state === 'exited') return '#f87171';
    if (state === 'paused') return '#fbbf24';
    if (state === 'created') return '#60a5fa';
    return '#94a3b8';
  };

  const filteredContainers = containers.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.names && c.names.join(' ').toLowerCase().includes(q)) ||
      (c.image && c.image.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q));
  });

  const filteredImages = images.filter(img => {
    const q = search.toLowerCase();
    return !q || (img.repoTags && img.repoTags.join(' ').toLowerCase().includes(q)) ||
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
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12, padding: 4, width: 'fit-content'
      }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); setSearch(''); }}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.92rem', transition: 'all 0.2s',
              background: tab === t.id ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: tab === t.id ? '#fff' : '#94a3b8',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search bar (for containers and images) */}
      {(tab === 'containers' || tab === 'images') && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text" placeholder={`🔍 Rechercher un ${tab === 'containers' ? 'container' : 'image'}...`}
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: 400, padding: '10px 16px', borderRadius: 10,
              border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(15, 23, 42, 0.6)',
              color: '#e2e8f0', fontSize: '0.9rem', outline: 'none'
            }}
          />
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 10, padding: '12px 16px', color: '#f87171', marginBottom: 16, fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          Chargement...
        </div>
      ) : (
        <>
          {/* ==================== CONTAINERS TAB ==================== */}
          {tab === 'containers' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Container</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Image</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>État</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Ports</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Créé</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContainers.map(c => (
                    <tr key={c.idFull} style={{
                      background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10,
                      transition: 'background 0.2s'
                    }}>
                      <td style={{ padding: '12px', borderRadius: '10px 0 0 10px' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.92rem' }}>
                          {c.names ? c.names[0] : c.id}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace' }}>{c.id}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                        {c.image}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
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
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>
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
                              display: 'inline-block', background: isPublic ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)',
                              color: '#60a5fa', borderRadius: 6, padding: '2px 8px', marginRight: 4,
                              fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none',
                              cursor: isPublic ? 'pointer' : 'default',
                              border: isPublic ? '1px solid rgba(96, 165, 250, 0.4)' : 'none',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { if (isPublic) e.currentTarget.style.background = 'rgba(59,130,246,0.4)'; }}
                            onMouseOut={e => { if (isPublic) e.currentTarget.style.background = 'rgba(59,130,246,0.25)'; }}
                            >
                              {p.publicPort ? `${p.publicPort}→${p.privatePort}` : p.privatePort}
                            </PortComponent>
                          );
                        }) : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '0.82rem' }}>
                        {timeAgo(c.created)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {c.state !== 'running' && (
                            <ActionBtn label="▶" title="Start" color="#4ade80"
                              loading={actionLoading === c.idFull}
                              onClick={() => doAction(api.startDockerContainer, c.idFull, c.names?.[0])} />
                          )}
                          {c.state === 'running' && (
                            <ActionBtn label="⏹" title="Stop" color="#f87171"
                              loading={actionLoading === c.idFull}
                              onClick={() => doAction(api.stopDockerContainer, c.idFull, c.names?.[0])} />
                          )}
                          <ActionBtn label="🔄" title="Restart" color="#fbbf24"
                            loading={actionLoading === c.idFull}
                            onClick={() => doAction(api.restartDockerContainer, c.idFull, c.names?.[0])} />
                          <ActionBtn label="📋" title="Logs" color="#60a5fa"
                            onClick={() => openLogs(c.idFull, c.names?.[0] || c.id)} />
                          <ActionBtn label="🗑" title="Supprimer" color="#f87171"
                            loading={actionLoading === c.idFull}
                            onClick={() => handleRemoveContainer(c.idFull, c.names?.[0] || c.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContainers.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  Aucun container trouvé.
                </div>
              )}
            </div>
          )}

          {/* ==================== IMAGES TAB ==================== */}
          {tab === 'images' && (
            <div>
              {/* Pull image bar */}
              <div style={{
                display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap'
              }}>
                <input type="text" placeholder="Ex: nginx:latest, redis:7-alpine..."
                  value={pullInput} onChange={e => setPullInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePull()}
                  style={{
                    flex: 1, minWidth: 250, padding: '10px 16px', borderRadius: 10,
                    border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(15, 23, 42, 0.6)',
                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <button onClick={handlePull} disabled={pullLoading || !pullInput.trim()}
                  style={{
                    background: pullLoading ? '#475569' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px',
                    cursor: pullLoading ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem'
                  }}>
                  {pullLoading ? '⏳ Pull en cours...' : '⬇️ Pull Image'}
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Repository : Tag</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Taille</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Créé</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImages.map(img => (
                    <tr key={img.idFull} style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                      <td style={{ padding: '12px', borderRadius: '10px 0 0 10px' }}>
                        {img.repoTags?.map((tag, i) => (
                          <span key={i} style={{
                            display: 'inline-block', background: 'rgba(99,102,241,0.15)',
                            color: '#a5b4fc', borderRadius: 6, padding: '3px 10px', marginRight: 6,
                            fontSize: '0.85rem', fontFamily: 'monospace'
                          }}>{tag}</span>
                        ))}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.82rem' }}>
                        {img.id}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#94a3b8', fontSize: '0.88rem' }}>
                        {formatBytes(img.size)}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '0.82rem' }}>
                        {timeAgo(img.created)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>
                        <ActionBtn label="🗑" title="Supprimer" color="#f87171"
                          loading={actionLoading === img.id}
                          onClick={() => handleRemoveImage(img.id, img.repoTags?.[0] || img.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredImages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Aucune image trouvée.</div>
              )}
            </div>
          )}

          {/* ==================== VOLUMES TAB ==================== */}
          {tab === 'volumes' && (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nom</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Driver</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mountpoint</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map(v => (
                  <tr key={v.name} style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                    <td style={{ padding: '12px', borderRadius: '10px 0 0 10px', fontWeight: 600, color: '#e2e8f0' }}>
                      💾 {v.name?.length > 30 ? v.name.substring(0, 30) + '...' : v.name}
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{v.driver}</td>
                    <td style={{
                      padding: '12px', borderRadius: '0 10px 10px 0', fontFamily: 'monospace',
                      color: '#64748b', fontSize: '0.82rem'
                    }}>{v.mountpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ==================== NETWORKS TAB ==================== */}
          {tab === 'networks' && (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nom</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Driver</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Scope</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Containers connectés</th>
                </tr>
              </thead>
              <tbody>
                {networks.map(n => (
                  <tr key={n.idFull} style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                    <td style={{ padding: '12px', borderRadius: '10px 0 0 10px' }}>
                      <div style={{ fontWeight: 600, color: '#e2e8f0' }}>🌐 {n.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace' }}>{n.id}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                        borderRadius: 6, padding: '3px 10px', fontSize: '0.82rem'
                      }}>{n.driver}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{n.scope}</td>
                    <td style={{ padding: '12px', borderRadius: '0 10px 10px 0' }}>
                      {n.containers && n.containers.length > 0 ? n.containers.map((ct, i) => (
                        <span key={i} style={{
                          display: 'inline-block', background: 'rgba(74,222,128,0.12)',
                          color: '#4ade80', borderRadius: 6, padding: '2px 8px', marginRight: 6,
                          fontSize: '0.78rem', marginBottom: 2
                        }}>
                          {ct.name}
                        </span>
                      )) : <span style={{ color: '#475569', fontSize: '0.85rem' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ==================== LOGS PANEL ==================== */}
      {logsPanel && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '50vw', minWidth: 400, height: '100vh',
          background: '#0f172a', borderLeft: '1px solid rgba(100,116,139,0.2)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)', animation: 'slideIn 0.25s ease-out'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid rgba(100,116,139,0.2)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#e2e8f0' }}>📋 Logs : {logsPanel.name}</h3>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{logsPanel.id}</span>
            </div>
            <button onClick={() => setLogsPanel(null)} style={{
              background: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'none',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600
            }}>✕ Fermer</button>
          </div>
          <pre style={{
            flex: 1, overflow: 'auto', padding: 20, margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem',
            lineHeight: 1.6, color: '#94a3b8', background: '#020617',
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
