import React from 'react';

export default function Dashboard({ projects, onRunPipeline, env }) {
  // Filtrer les projets selon l'environnement actif
  const filteredProjects = projects.filter(p => env === 'Global' || p.environment === env);

  // Compter le nombre de pipelines associés
  const totalPipelinesCount = filteredProjects.reduce((acc, p) => acc + (p.pipelines ? p.pipelines.length : 0), 0);

  // Extraire toutes les exécutions pour l'affichage des récents
  const recentExecutions = [];
  filteredProjects.forEach(proj => {
    if (proj.pipelines) {
      proj.pipelines.forEach(pip => {
        if (pip.executions) {
          pip.executions.forEach(exec => {
            recentExecutions.push({
              projectName: proj.name,
              projectId: proj.id,
              pipelineId: pip.externalId,
              branch: pip.branch || 'main',
              executionId: exec.executionId,
              status: exec.status,
              duration: exec.durationInSeconds,
              startedAt: new Date(exec.startedAt)
            });
          });
        }
      });
    }
  });

  // Trier les exécutions par date de démarrage (les plus récentes d'abord)
  recentExecutions.sort((a, b) => b.startedAt - a.startedAt);
  const displayExecutions = recentExecutions.slice(0, 5); // Garder les 5 plus récents

  // Calcul de la santé système (pourcentage de builds réussis)
  const allBuilds = recentExecutions;
  const successBuilds = allBuilds.filter(b => b.status === 'SUCCESS');
  const systemHealth = allBuilds.length > 0 
    ? ((successBuilds.length / allBuilds.length) * 100).toFixed(1) + '%' 
    : '100%';

  const formatDuration = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Overview of your projects and system status.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{filteredProjects.length}</span>
            <span className="stat-trend trend-up">
              ↑ 12% <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>vs last month</span>
            </span>
          </div>
          <div className="stat-icon-wrapper">📁</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Pipelines</span>
            <span className="stat-value">{totalPipelinesCount}</span>
            <span className="stat-trend" style={{ color: 'var(--status-running)' }}>
              ● {allBuilds.filter(b => b.status === 'RUNNING').length} running now
            </span>
          </div>
          <div className="stat-icon-wrapper">⚡</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">System Success Rate</span>
            <span className="stat-value">{systemHealth}</span>
            <span className="stat-trend trend-up">
              All services operational
            </span>
          </div>
          <div className="stat-icon-wrapper">💚</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">Recent Pipeline Executions</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project / Pipeline</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayExecutions.map((exec, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="project-meta">
                      <span className="project-name-cell">{exec.projectName}</span>
                      <span className="project-repo-cell">{exec.pipelineId}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                      {exec.branch}
                    </code>
                  </td>
                  <td>
                    <span className={`status-badge status-${exec.status.toLowerCase()}`}>
                      {exec.status}
                    </span>
                  </td>
                  <td>{formatDuration(exec.duration)}</td>
                  <td>
                    <span 
                      className="action-link"
                      onClick={() => onRunPipeline(exec.projectId, exec.pipelineId)}
                    >
                      Re-run
                    </span>
                  </td>
                </tr>
              ))}
              {displayExecutions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recent executions found for the selected environment.
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
