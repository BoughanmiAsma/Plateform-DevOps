import React, { useState } from 'react';

export default function RunBuildModal({ isOpen, onClose, onSubmit, project, pipelineId }) {
  const [branch, setBranch] = useState('dev');
  const [env, setEnv] = useState('DEV');
  const [runSonar, setRunSonar] = useState(true);
  const [buildDocker, setBuildDocker] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parameters = {
      BRANCH: branch,
      ENV: env,
      RUN_SONAR: runSonar ? "true" : "false",
      BUILD_DOCKER: buildDocker ? "true" : "false"
    };

    try {
      await onSubmit(project.id, pipelineId, parameters);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'exécution", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">🚀 Run Pipeline</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pipeline name info */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1rem',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--accent-primary)'
          }}>
            📦 {pipelineId}
          </div>

          <div className="form-group">
            <label className="form-label">BRANCH — Branche Git à builder</label>
            <input
              type="text"
              className="form-control"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="Ex: main, dev, feature/xyz"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ENV — Environnement de déploiement</label>
            <select
              className="form-control"
              value={env}
              onChange={e => setEnv(e.target.value)}
            >
              <option value="DEV">DEV</option>
              <option value="STG">STG</option>
              <option value="PROD">PROD</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={runSonar}
                onChange={e => setRunSonar(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span>
                <strong>RUN_SONAR</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.8rem' }}>— Activer SonarQube ?</span>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={buildDocker}
                onChange={e => setBuildDocker(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span>
                <strong>BUILD_DOCKER</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.8rem' }}>— Construire l'image Docker ?</span>
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '⏳ Starting...' : '▶ Build'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
