import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const COMPANY = 'SmartIT DevOps Platform';

function SeverityBadge({ severity }) {
  const styles = {
    HIGH:   { bg: '#3b0a0a', color: '#f87171', border: '#991b1b' },
    MEDIUM: { bg: '#422006', color: '#fb923c', border: '#9a3412' },
    LOW:    { bg: '#1e3a5f', color: '#60a5fa', border: '#1d4ed8' }
  };
  const s = styles[severity] || styles.LOW;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
    }}>
      {severity}
    </span>
  );
}

export default function FinOpsReport() {
  const reportRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [allCosts, setAllCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedAt] = useState(new Date());

  const currentMonth = generatedAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const projs = await api.getAllProjects();
        setProjects(projs);

        // Fetch FinOps data for all projects
        const costsData = await Promise.all(
          projs.map(p => api.getFinOpsProjectCost(p.name).catch(() => null))
        );
        setAllCosts(costsData.filter(Boolean));
      } catch (err) {
        setError('Impossible de charger les données FinOps : ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalInfra     = allCosts.reduce((s, c) => s + (c.infraCost || 0), 0);
  const totalPipeline  = allCosts.reduce((s, c) => s + (c.pipelineCost || 0), 0);
  const totalCost      = allCosts.reduce((s, c) => s + (c.totalCost || 0), 0);
  const allRecommendations = allCosts.flatMap(c => c.recommendations || []);
  const totalSavings   = allRecommendations.reduce((s, r) => s + (r.estimatedMonthlySavings || 0), 0);
  const optimizationRate = totalCost > 0 ? (totalSavings / totalCost * 100).toFixed(1) : 0;

  // Sort recommendations by savings desc, then severity
  const sortedRecs = [...allRecommendations].sort((a, b) => {
    const sevOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const sa = sevOrder[a.severity] ?? 3;
    const sb = sevOrder[b.severity] ?? 3;
    if (sa !== sb) return sa - sb;
    return (b.estimatedMonthlySavings || 0) - (a.estimatedMonthlySavings || 0);
  });

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
    const pageHeight = pdf.internal.pageSize.getHeight();
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    let remaining = pdfHeight - pageHeight;
    while (remaining > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      remaining -= pageHeight;
    }
    pdf.save(`Rapport_FinOps_${currentMonth.replace(' ', '_')}.pdf`);
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
            📊 Rapport FinOps Mensuel
          </h1>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Période : {currentMonth} — Généré le {generatedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>⏳ Calcul des coûts pour tous les projets...</div>}
      {error && <div style={{ color: '#f87171', padding: '1rem', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>⚠️ {error}</div>}

      {!loading && !error && (
        <div ref={reportRef} style={{ fontFamily: "'Inter', sans-serif", color: '#e2e8f0', background: '#0f172a' }}>

          {/* Report Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2e1a 0%, #0f172a 60%)',
            borderRadius: '16px', padding: '2.5rem', marginBottom: '1.5rem',
            border: '1px solid #166534', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {COMPANY}
                </div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  Rapport FinOps Mensuel
                </h1>
                <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                  Analyse des dépenses infrastructure & recommandations d'optimisation
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Période</div>
                <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>{currentMonth}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Projets analysés</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{projects.length} projet(s)</div>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Coût Total Mensuel', value: `$${totalCost.toFixed(2)}`, color: '#38bdf8', icon: '💰', desc: 'Infra + CI/CD' },
              { label: 'Coût Infrastructure', value: `$${totalInfra.toFixed(2)}`, color: '#818cf8', icon: '☁️', desc: 'Kubernetes (K8s)' },
              { label: 'Coût Pipelines', value: `$${totalPipeline.toFixed(2)}`, color: '#a78bfa', icon: '⚙️', desc: 'Jenkins CI/CD' },
              { label: 'Économies Possibles', value: `$${totalSavings.toFixed(2)}`, color: '#4ade80', icon: '📉', desc: `${optimizationRate}% d'optimisation` }
            ].map((kpi, i) => (
              <div key={i} style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                padding: '1.25rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.25rem' }}>{kpi.desc}</div>
              </div>
            ))}
          </div>

          {/* Cost by Project Table */}
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>📋 Ventilation des Coûts par Projet</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['Projet', 'Coût Infra (K8s)', 'Coût CI/CD', 'Total Mensuel', 'Alertes', 'Économies Possibles'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allCosts.map((cost, i) => {
                  const projSavings = (cost.recommendations || []).reduce((s, r) => s + (r.estimatedMonthlySavings || 0), 0);
                  const highCount   = (cost.recommendations || []).filter(r => r.severity === 'HIGH').length;
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#182032' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{cost.projectId}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#818cf8', fontFamily: 'monospace', fontWeight: 600 }}>${(cost.infraCost || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 600 }}>${(cost.pipelineCost || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem' }}>${(cost.totalCost || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        {highCount > 0
                          ? <span style={{ color: '#f87171', fontWeight: 700 }}>🔴 {highCount} critique(s)</span>
                          : <span style={{ color: '#4ade80' }}>✅ OK</span>
                        }
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: 600 }}>
                        {projSavings > 0 ? `$${projSavings.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr style={{ borderTop: '2px solid #1d4ed8', background: '#0f172a' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 800, color: '#fff' }}>TOTAL</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#818cf8', fontFamily: 'monospace', fontWeight: 800 }}>${totalInfra.toFixed(2)}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 800 }}>${totalPipeline.toFixed(2)}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>${totalCost.toFixed(2)}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: 800 }}>${totalSavings.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Optimization Recommendations */}
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>
                🎯 Recommandations d'Optimisation ({sortedRecs.length})
              </h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {sortedRecs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#4ade80', fontWeight: 600 }}>
                  ✅ Aucune recommandation. L'allocation des ressources est optimale pour tous les projets.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0f172a' }}>
                      {['#', 'Titre', 'Description', 'Sévérité', 'Gain / mois'].map(h => (
                        <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecs.map((rec, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#182032' }}>
                        <td style={{ padding: '0.8rem 1rem', color: '#64748b', fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{rec.title}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.5 }}>{rec.description}</td>
                        <td style={{ padding: '0.8rem 1rem' }}><SeverityBadge severity={rec.severity} /></td>
                        <td style={{ padding: '0.8rem 1rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: 800 }}>
                          ${(rec.estimatedMonthlySavings || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Conclusion */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0) 100%)',
            border: '1px solid #065f46', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>📌 Conclusion & Actions pour le Mois Prochain</h2>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', lineHeight: 2 }}>
              <li>
                Potentiel d'optimisation identifié : <strong style={{ color: '#4ade80' }}>{optimizationRate}%</strong> du budget total (
                <strong style={{ color: '#4ade80' }}>${totalSavings.toFixed(2)} / mois</strong> d'économies potentielles).
              </li>
              {sortedRecs.filter(r => r.severity === 'HIGH').length > 0 && (
                <li>
                  <strong style={{ color: '#f87171' }}>{sortedRecs.filter(r => r.severity === 'HIGH').length}</strong> recommandation(s) <strong style={{ color: '#f87171' }}>CRITIQUE(S)</strong> à traiter en priorité lors du prochain sprint.
                </li>
              )}
              <li>Implémenter les recommendations d'optimisation des ressources CPU/RAM pour réduire les coûts d'infrastructure.</li>
              <li>Planifier un suivi budgétaire dans 30 jours pour mesurer l'impact des optimisations mises en place.</li>
            </ul>
          </div>

          {/* Footer */}
          <div style={{
            background: '#0f172a', borderRadius: '12px', border: '1px solid #1a2e1a',
            padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>🔒 DOCUMENT CONFIDENTIEL — USAGE INTERNE</div>
              <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.25rem' }}>
                Rapport généré automatiquement par {COMPANY} · Données extraites en temps réel de Prometheus & Jenkins.
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
