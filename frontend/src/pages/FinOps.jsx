import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function FinOps({ setPage }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectFinOps, setProjectFinOps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState(null);

  // Load all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getAllProjects();
        setProjects(data);
      } catch (err) {
        setError("Failed to load projects: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch FinOps data for the selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectFinOps(null);
      return;
    }
    const fetchProjectCost = async () => {
      setLoadingProject(true);
      try {
        const proj = projects.find(p => p.id === selectedProjectId);
        if (proj) {
          // The backend expects the project name (namespace) for Prometheus queries
          const data = await api.getFinOpsProjectCost(proj.name);
          setProjectFinOps(data);
        }
      } catch (err) {
        setError("Failed to fetch FinOps data for project: " + err.message);
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProjectCost();
  }, [selectedProjectId, projects]);

  if (loading) return <div className="page-container"><div className="loading-state">Chargement...</div></div>;
  if (error) return <div className="page-container"><div className="error-state">Erreur : {error}</div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Dashboard FinOps</h1>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="project-selector" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Sélectionner un projet :</label>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                background: 'var(--surface)', 
                color: 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">-- Choisir un projet --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setPage('finops-report')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            📊 Générer Rapport
          </button>
        </div>
      </div>

      {!selectedProjectId ? (
        <div className="empty-state" style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2>Aucun projet sélectionné</h2>
          <p>Choisissez un projet dans la liste déroulante ci-dessus pour visualiser et calculer ses coûts FinOps d'infrastructure (K8s) et de CI/CD (Jenkins).</p>
        </div>
      ) : loadingProject ? (
        <div className="loading-state" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div className="spinner"></div>
          <p>Calcul des coûts en cours depuis les Pods Kubernetes...</p>
        </div>
      ) : projectFinOps ? (
        <>
          <div className="finops-kpi-grid">
            <div className="kpi-card total">
              <div className="kpi-title">Coût Total (Mensuel)</div>
              <div className="kpi-value">${projectFinOps.totalCost.toFixed(2)}</div>
            </div>
            <div className="kpi-card infra">
              <div className="kpi-title">Coût Infrastructure (K8s)</div>
              <div className="kpi-value">${projectFinOps.infraCost.toFixed(2)}</div>
            </div>
            <div className="kpi-card pipeline">
              <div className="kpi-title">Coût Pipelines (CI/CD)</div>
              <div className="kpi-value">${projectFinOps.pipelineCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="finops-content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="finops-section recommendations">
              <h2 className="section-title">Recommandations d'Optimisation pour {projectFinOps.projectId}</h2>
              <div className="recommendations-list">
                {projectFinOps.recommendations.length === 0 ? (
                  <div className="no-data" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
                    ✅ Aucune recommandation pour le moment. L'allocation des ressources de votre projet est optimale !
                  </div>
                ) : (
                  projectFinOps.recommendations.map((rec, idx) => (
                    <div key={idx} className={`recommendation-card severity-${rec.severity.toLowerCase()}`}>
                      <div className="rec-header">
                        <span className="rec-type">{rec.title}</span>
                        <span className={`rec-badge ${rec.severity.toLowerCase()}`}>{rec.severity}</span>
                      </div>
                      <div className="rec-body">
                        <p>{rec.description}</p>
                        <div className="rec-savings">
                          Gain estimé : <strong>${rec.estimatedMonthlySavings.toFixed(2)} / mois</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
