import React, { useState } from 'react';

export default function Deployments({ projects, onRunPipeline, env }) {
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [selectedEnvFilter, setSelectedEnvFilter] = useState('All');

  // Extraire tous les déploiements de tous les projets
  const allDeployments = [];
  projects.forEach(proj => {
    if (proj.pipelines) {
      proj.pipelines.forEach(pip => {
        if (pip.executions) {
          pip.executions.forEach((exec, idx) => {
            // Générer un numéro de version incrémental réaliste basé sur le build
            const buildNum = exec.executionId.replace(/\D/g, '') || (100 - idx);
            const version = `v1.${Math.floor(buildNum / 10)}.${buildNum % 10}`;

            allDeployments.push({
              id: exec.executionId,
              projectName: proj.name,
              projectId: proj.id,
              pipelineId: pip.externalId,
              environment: proj.environment,
              version: version,
              status: exec.status,
              startedAt: new Date(exec.startedAt),
              dateString: new Date(exec.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            });
          });
        }
      });
    }
  });

  // Trier par date décroissante
  allDeployments.sort((a, b) => b.startedAt - a.startedAt);

  // Appliquer les filtres (Filtre global de la Navbar + Filtres locaux de la page)
  const filteredDeployments = allDeployments.filter(d => {
    // Filtrer par le sélecteur global d'environnement de la Navbar
    if (env !== 'Global' && d.environment !== env) return false;
    
    // Filtrer par le sélecteur de projet local de la page
    if (selectedProjectFilter !== 'All' && d.projectName !== selectedProjectFilter) return false;

    // Filtrer par le sélecteur d'environnement local de la page
    if (selectedEnvFilter !== 'All' && d.environment !== selectedEnvFilter) return false;

    return true;
  });

  const getEnvClass = (environment) => {
    switch (environment?.toUpperCase()) {
      case 'PROD': return 'env-prod';
      case 'STG': return 'env-stg';
      case 'DEV':
      default: return 'env-dev';
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Deployments History</h1>
          <p className="page-subtitle">Track all releases across environments.</p>
        </div>
      </div>

      <div className="section-card">
        <div className="filters-row">
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Projects</option>
            {Array.from(new Set(projects.map(p => p.name))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={selectedEnvFilter}
            onChange={(e) => setSelectedEnvFilter(e.target.value)}
            className="filter-select"
            disabled={env !== 'Global'} // Désactivé si un env global est déjà sélectionné
          >
            <option value="All">All Environments</option>
            <option value="PROD">Production (PROD)</option>
            <option value="STG">Staging (STG)</option>
            <option value="DEV">Development (DEV)</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project / Service</th>
                <th>Environment</th>
                <th>Version</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeployments.map((dep) => (
                <tr key={dep.id}>
                  <td>
                    <div className="project-meta">
                      <span className="project-name-cell">{dep.projectName}</span>
                      <span className="project-repo-cell">{dep.pipelineId}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`env-badge ${getEnvClass(dep.environment)}`}>
                      {dep.environment}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {dep.version}
                    </code>
                  </td>
                  <td>
                    <span className={`status-badge status-${dep.status.toLowerCase()}`}>
                      {dep.status}
                    </span>
                  </td>
                  <td>{dep.dateString}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span className="action-link" onClick={() => alert(`Viewing logs for deployment ${dep.id}`)}>
                        View
                      </span>
                      {dep.status === 'FAILED' && (
                        <span className="action-link" style={{ color: 'var(--status-running)' }} onClick={() => onRunPipeline(dep.projectId, dep.pipelineId)}>
                          Retry
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDeployments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No deployments matching filters.
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
