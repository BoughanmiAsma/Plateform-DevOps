import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const COMPANY = 'SmartIT DevOps Platform';

// Thresholds for health evaluation
const THRESHOLDS = {
  cpu:       { warning: 70, critical: 85, unit: '%', label: 'CPU Usage' },
  memory:    { warning: 10, critical: 13, unit: ' GB', label: 'Mémoire RAM' },
  errorRate: { warning: 2,  critical: 5,  unit: '%', label: 'Taux d\'Erreurs' },
  rps:       { warning: null, critical: null, unit: ' RPS', label: 'Requêtes / sec' }
};

function getStatus(key, value) {
  if (!value && value !== 0) return 'unknown';
  const t = THRESHOLDS[key];
  if (!t.critical) return 'ok';
  if (value >= t.critical) return 'critical';
  if (value >= t.warning) return 'warning';
  return 'ok';
}

function getLastValue(metric) {
  if (!metric || !metric.points || metric.points.length === 0) return null;
  return metric.points[metric.points.length - 1].value;
}

function StatusBadge({ status }) {
  const styles = {
    ok:       { bg: '#052e16', color: '#4ade80', border: '#166534', label: '✅ Normal' },
    warning:  { bg: '#422006', color: '#fb923c', border: '#9a3412', label: '⚠️ Attention' },
    critical: { bg: '#3b0a0a', color: '#f87171', border: '#991b1b', label: '🔴 Critique' },
    unknown:  { bg: '#1e293b', color: '#94a3b8', border: '#334155', label: '⬜ N/A' }
  };
  const s = styles[status] || styles.unknown;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
    }}>
      {s.label}
    </span>
  );
}

export default function ObservabilityReport() {
  const reportRef = useRef(null);
  const [metrics, setMetrics] = useState({ cpu: null, memory: null, rps: null, errorRate: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedAt] = useState(new Date());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cpu, memory, rps, errorRate] = await Promise.all([
          api.getMetrics('cpu', 60),
          api.getMetrics('memory', 60),
          api.getMetrics('rps', 60),
          api.getMetrics('errorRate', 60)
        ]);
        setMetrics({ cpu, memory, rps, errorRate });
      } catch (err) {
        setError('Impossible de récupérer les métriques Prometheus : ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const values = {
    cpu:       getLastValue(metrics.cpu),
    memory:    getLastValue(metrics.memory),
    errorRate: getLastValue(metrics.errorRate),
    rps:       getLastValue(metrics.rps)
  };

  const statuses = {
    cpu:       getStatus('cpu', values.cpu),
    memory:    getStatus('memory', values.memory),
    errorRate: getStatus('errorRate', values.errorRate),
    rps:       getStatus('rps', values.rps)
  };

  const criticalCount = Object.values(statuses).filter(s => s === 'critical').length;
  const warningCount  = Object.values(statuses).filter(s => s === 'warning').length;
  const globalStatus  = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'ok';

  const globalStatusInfo = {
    ok:       { label: '🟢 Système Stable',   color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: '#166534' },
    warning:  { label: '🟡 Vigilance Requise',color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: '#92400e' },
    critical: { label: '🔴 État Critique',    color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: '#7f1d1d' }
  }[globalStatus];

  const alerts = [
    ...(statuses.cpu === 'critical' ? [{ severity: 'CRITIQUE', title: 'CPU en saturation', description: `L'utilisation CPU a atteint ${values.cpu?.toFixed(1)}% (seuil critique : 85%). Risque de dégradation de service imminent. Action urgente requise.`, action: 'Augmenter les ressources allouées ou identifier les processus gourmands.' }] : []),
    ...(statuses.cpu === 'warning' ? [{ severity: 'ALERTE', title: 'CPU élevé', description: `L'utilisation CPU est à ${values.cpu?.toFixed(1)}% (seuil d'alerte : 70%). Surveiller l'évolution.`, action: 'Analyser les processus et prévoir une montée en charge si la tendance persiste.' }] : []),
    ...(statuses.memory === 'critical' ? [{ severity: 'CRITIQUE', title: 'Mémoire proche de la saturation', description: `La consommation RAM est de ${values.memory?.toFixed(2)} GB (seuil critique : 13 GB). Risque de swap et d'OOM Kill.`, action: 'Redémarrer les services non critiques, libérer la mémoire ou provisionner davantage.' }] : []),
    ...(statuses.memory === 'warning' ? [{ severity: 'ALERTE', title: 'Mémoire RAM élevée', description: `RAM consommée : ${values.memory?.toFixed(2)} GB (seuil : 10 GB). Tendance à surveiller.`, action: 'Analyser la consommation des pods, vérifier les fuites mémoire.' }] : []),
    ...(statuses.errorRate === 'critical' ? [{ severity: 'CRITIQUE', title: 'Taux d\'erreur anormal', description: `Le taux d'erreurs HTTP a atteint ${values.errorRate?.toFixed(3)}% (seuil critique : 5%). Degradation de l'expérience utilisateur.`, action: 'Consulter les logs d\'erreurs, vérifier les services impactés et déclencher une cellule de crise si nécessaire.' }] : []),
    ...(statuses.errorRate === 'warning' ? [{ severity: 'ALERTE', title: 'Taux d\'erreur en hausse', description: `Taux d'erreurs : ${values.errorRate?.toFixed(3)}% (seuil : 2%). À surveiller.`, action: 'Analyser les logs pour identifier les endpoints défaillants.' }] : []),
  ];

  const recommendations = [
    ...(criticalCount > 0 ? ['Déclencher une réunion de crise avec l\'équipe infrastructure dans l\'heure.'] : []),
    ...(statuses.cpu !== 'ok' ? ['Configurer l\'autoscaling horizontal (HPA) sur les Deployments Kubernetes concernés.'] : []),
    ...(statuses.memory !== 'ok' ? ['Revoir les limites mémoire (Memory Limits) dans les manifestes Kubernetes des pods concernés.'] : []),
    ...(statuses.errorRate !== 'ok' ? ['Activer les alertes Prometheus/Alertmanager sur le taux d\'erreur pour une notification proactive.'] : []),
    ...(criticalCount === 0 && warningCount === 0 ? ['Le système est en pleine santé. Maintenir la surveillance et planifier le prochain audit dans 30 jours.'] : []),
  ];

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    let remainingHeight = pdfHeight - pageHeight;
    while (remainingHeight > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      remainingHeight -= pageHeight;
    }
    pdf.save(`Rapport_Observabilite_${generatedAt.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="page-content">
      {/* Action Bar */}
      <div className="report-action-bar" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', padding: '1rem 1.5rem',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
            📄 Rapport d'Observabilité
          </h1>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Généré le {generatedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🖨️ Imprimer
          </button>
          <button onClick={handleExportPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⬇️ Exporter PDF
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>⏳ Récupération des métriques Prometheus...</div>}
      {error && <div style={{ color: '#f87171', padding: '1rem', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>⚠️ {error}</div>}

      {!loading && !error && (
        <div ref={reportRef} style={{ fontFamily: "'Inter', sans-serif", color: '#e2e8f0', background: '#0f172a' }}>

          {/* Report Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%)',
            borderRadius: '16px', padding: '2.5rem', marginBottom: '1.5rem',
            border: '1px solid #1e40af', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {COMPANY}
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  Rapport d'Observabilité
                </h1>
                <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                  Analyse des performances système & alertes critiques
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Période analysée</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600 }}>Dernière heure</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Date d'édition</div>
                <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                  {generatedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{
            background: globalStatusInfo.bg, border: `1px solid ${globalStatusInfo.border}`,
            borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '1.5rem'
          }}>
            <div style={{ fontSize: '3rem' }}>
              {globalStatus === 'ok' ? '🟢' : globalStatus === 'warning' ? '🟡' : '🔴'}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.25rem' }}>Résumé Exécutif</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: globalStatusInfo.color }}>{globalStatusInfo.label}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                {criticalCount} alerte(s) critique(s) • {warningCount} avertissement(s) • {4 - criticalCount - warningCount} métrique(s) normale(s)
              </div>
            </div>
          </div>

          {/* Metrics Table */}
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>📊 Tableau de Métriques Critiques</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['Métrique', 'Valeur Actuelle', 'Seuil Alerte', 'Seuil Critique', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(THRESHOLDS).map(([key, t], i) => (
                  <tr key={key} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#182032' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#e2e8f0' }}>{t.label}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>
                      {values[key] != null ? `${values[key].toFixed(2)}${t.unit}` : '—'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#fbbf24' }}>{t.warning ? `${t.warning}${t.unit}` : '—'}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#f87171' }}>{t.critical ? `${t.critical}${t.unit}` : '—'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status={statuses[key]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts Section */}
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>🚨 Alertes Actives ({alerts.length})</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#4ade80', fontWeight: 600 }}>
                  ✅ Aucune alerte active. Tous les systèmes fonctionnent normalement.
                </div>
              ) : alerts.map((alert, i) => (
                <div key={i} style={{
                  background: alert.severity === 'CRITIQUE' ? 'rgba(248,113,113,0.07)' : 'rgba(251,191,36,0.07)',
                  border: `1px solid ${alert.severity === 'CRITIQUE' ? '#991b1b' : '#92400e'}`,
                  borderRadius: '10px', padding: '1.25rem', marginBottom: i < alerts.length - 1 ? '0.75rem' : 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: alert.severity === 'CRITIQUE' ? '#f87171' : '#fbbf24', fontSize: '0.95rem' }}>
                      {alert.title}
                    </span>
                    <span style={{
                      background: alert.severity === 'CRITIQUE' ? '#7f1d1d' : '#78350f',
                      color: alert.severity === 'CRITIQUE' ? '#fca5a5' : '#fcd34d',
                      padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em'
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>{alert.description}</p>
                  <div style={{ background: '#0f172a', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <strong style={{ color: '#60a5fa' }}>➡ Action recommandée : </strong>{alert.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>🎯 Recommandations Prioritaires</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < recommendations.length - 1 ? '0.75rem' : 0 }}>
                  <span style={{ background: '#1d4ed8', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Footer */}
          <div style={{
            background: '#0f172a', borderRadius: '12px', border: '1px solid #1e3a5f',
            padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>🔒 DOCUMENT CONFIDENTIEL</div>
              <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.25rem' }}>
                Généré automatiquement par {COMPANY} — Rapport interne à usage exclusif de la direction.
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
              <div>{generatedAt.toLocaleDateString('fr-FR')}</div>
              <div>{generatedAt.toLocaleTimeString('fr-FR')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
