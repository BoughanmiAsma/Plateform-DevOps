import React from 'react';

export default function Projects({ projects, onOpenModal, onRunPipeline, env }) {
  // Filtrer les projets par l'environnement sélectionné
  const filteredProjects = projects.filter(p => env === 'Global' || p.environment === env);

  const getEnvClass = (environment) => {
    switch (environment?.toUpperCase()) {
      case 'PROD': return 'env-prod';
      case 'STG': return 'env-stg';
      case 'DEV':
      default: return 'env-dev';
    }
  };

  const getProviderBadge = (pipelines) => {
    if (!pipelines || pipelines.length === 0) return 'NO CD';
    const provider = pipelines[0].provider;
    return provider === 'GITHUB_ACTIONS' ? 'GitHub Actions' : 'Jenkins';
  };

  const getLastBuildInfo = (pipelines) => {
    if (!pipelines || pipelines.length === 0) return null;
    
    // Récupérer toutes les exécutions de tous les pipelines du projet
    const allExecs = [];
    pipelines.forEach(p => {
      if (p.executions) {
        p.executions.forEach(e => {
          allExecs.push({
            ...e,
            pipelineName: p.name
          });
        });
      }
    });

    if (allExecs.length === 0) return null;

    // Prendre la plus récente
    allExecs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    return allExecs[0];
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your repositories and CI/CD connections.</p>
        </div>
        <button className="btn-primary" onClick={() => onOpenModal('create')}>
          <span>+</span> Create Project
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => {
          const lastBuild = getLastBuildInfo(project.pipelines);
          const hasPipelines = project.pipelines && project.pipelines.length > 0;

          return (
            <div key={project.id} className="project-card">
              <div>
                <div className="project-card-header">
                  <div className="project-icon-box">📦</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`env-badge ${getEnvClass(project.environment)}`}>
                      {project.environment}
                    </span>
                    <span className="provider-badge">
                      {getProviderBadge(project.pipelines)}
                    </span>
                  </div>
                </div>

                <h3 className="project-card-title">{project.name}</h3>
                <span className="project-card-repo">{project.repositoryUrl}</span>
              </div>

              <div>
                <div className="project-card-footer">
                  <div className="build-status-indicator">
                    {lastBuild ? (
                      <>
                        <span>Last build:</span>
                        <span className={`status-badge status-${lastBuild.status.toLowerCase()}`}>
                          {lastBuild.status}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No builds yet</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                      onClick={() => onOpenModal('associate', project)}
                    >
                      Setup CD
                    </button>
                    {hasPipelines && (
                      <button
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        onClick={() => onRunPipeline(project.id, project.pipelines[0].externalId)}
                      >
                        Run Build
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}>
            No projects found. Click "Create Project" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
