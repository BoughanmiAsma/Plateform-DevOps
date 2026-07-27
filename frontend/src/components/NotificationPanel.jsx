import React from 'react';

const SEVERITY_CONFIG = {
  CRITICAL: { icon: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: '#991b1b' },
  WARNING:  { icon: '⚠️', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: '#92400e' },
  INFO:     { icon: 'ℹ️', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: '#1d4ed8' }
};

const TYPE_LABEL = {
  PROMETHEUS: '📊 Prometheus',
  JENKINS:    '⚙️ Jenkins'
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

export default function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)'
        }}
      />

      {/* Panneau slide-in */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '420px',
        background: '#0d1117', borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 999, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.25s ease'
      }}>

        {/* Header du panneau */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#080b10'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e6edf3', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔔 Notifications
              {unread > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                  borderRadius: '999px', padding: '1px 8px', minWidth: '20px', textAlign: 'center'
                }}>
                  {unread}
                </span>
              )}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#8b949e' }}>
              Alertes Prometheus & Jenkins
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                style={{
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', borderRadius: '8px', padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                }}
              >
                Tout lire
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#8b949e', borderRadius: '8px', padding: '0.4rem 0.6rem',
                fontSize: '1rem', cursor: 'pointer', lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#484f58' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
              <p style={{ fontWeight: 600, color: '#8b949e' }}>Aucune notification</p>
              <p style={{ fontSize: '0.8rem' }}>Le système est en bonne santé.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const cfg = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.INFO;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && onMarkRead(notif.id)}
                  style={{
                    background: notif.read ? '#0d1117' : cfg.bg,
                    border: `1px solid ${notif.read ? 'rgba(255,255,255,0.06)' : cfg.border}`,
                    borderRadius: '10px', padding: '1rem', marginBottom: '0.5rem',
                    cursor: notif.read ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: notif.read ? 0.65 : 1,
                    position: 'relative'
                  }}
                >
                  {/* Indicateur non-lu */}
                  {!notif.read && (
                    <span style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: cfg.color, display: 'inline-block'
                    }} />
                  )}

                  {/* Type + heure */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {TYPE_LABEL[notif.type] || notif.type}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Titre */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cfg.icon}</span>
                    <div>
                      <p style={{
                        margin: 0, fontWeight: 700, fontSize: '0.88rem',
                        color: notif.read ? '#8b949e' : cfg.color
                      }}>
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {notif.message}
                        </p>
                      )}
                      {notif.projectId && (
                        <span style={{
                          display: 'inline-block', marginTop: '0.4rem',
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                          color: '#818cf8', borderRadius: '4px', padding: '1px 8px', fontSize: '0.7rem'
                        }}>
                          📁 {notif.projectId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.72rem', color: '#484f58', textAlign: 'center', background: '#080b10'
        }}>
          Actualisation automatique toutes les 30 secondes
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
