import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProjectModal({ isOpen, onClose, mode, project, onSuccess }) {
  // Mode peut être 'create' ou 'associate'
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [availablePipelines, setAvailablePipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setName('');
      setRepoUrl('');
      setSelectedPipelineId('');
      setSelectedPipelines([]);
      setAvailablePipelines([]);

      setLoading(true);
      // Récupérer tous les pipelines Jenkins disponibles pour la création ou l'association
      api.getJenkinsPipelines()
        .then(data => {
          setAvailablePipelines(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch Jenkins pipelines:', err);
          setError('Failed to fetch Jenkins pipelines. Make sure the backend and Jenkins are running.');
          setLoading(false);
        });

      if (mode === 'associate' && project) {
        // Pré-charger les pipelines existants du projet
        const currentIds = project.pipelines ? project.pipelines.map(p => p.externalId) : [];
        setSelectedPipelines(currentIds);
      }
    }
  }, [isOpen, mode, project]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'create') {
        if (!name.trim() || !repoUrl.trim()) {
          throw new Error('Project name and Repository URL are required');
        }
        if (!selectedPipelineId) {
          throw new Error('Please select a Jenkins pipeline');
        }

        // 1. Créer le projet dans le backend
        const newProject = await api.createProject(name.trim(), repoUrl.trim());
        
        // 2. Associer immédiatement le pipeline Jenkins sélectionné
        await api.associatePipelines(newProject.id, [selectedPipelineId]);
        
        onSuccess(newProject);
      } else if (mode === 'associate' && project) {
        const updatedProject = await api.associatePipelines(project.id, selectedPipelines);
        onSuccess(updatedProject);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePipeline = (id) => {
    if (selectedPipelines.includes(id)) {
      setSelectedPipelines(selectedPipelines.filter(item => item !== id));
    } else {
      setSelectedPipelines([...selectedPipelines, id]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'create' ? 'Create New Project' : `Associate Pipelines: ${project?.name}`}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{
            color: 'var(--status-failed)',
            backgroundColor: 'var(--status-failed-bg)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'create' ? (
            <>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. E-Commerce Core"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repository URL</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/username/project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenkins Pipeline (Dropdown)</label>
                {loading && availablePipelines.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                    Loading Jenkins jobs...
                  </div>
                ) : (
                  <select
                    value={selectedPipelineId}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">-- Choose an external Jenkins Pipeline --</option>
                    {availablePipelines.map(pipe => (
                      <option key={pipe.id} value={pipe.id}>
                        {pipe.name}
                      </option>
                    ))}
                  </select>
                )}
                {availablePipelines.length === 0 && !loading && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No jobs fetched. Please verify Jenkins settings.
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Select Available Jenkins Pipelines</label>
              {loading && availablePipelines.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                  Loading pipelines...
                </div>
              ) : (
                <div className="pipeline-list">
                  {availablePipelines.map(pipe => (
                    <label key={pipe.id} className="pipeline-item">
                      <input
                        type="checkbox"
                        checked={selectedPipelines.includes(pipe.id)}
                        onChange={() => handleTogglePipeline(pipe.id)}
                      />
                      <span>{pipe.name}</span>
                    </label>
                  ))}
                  {availablePipelines.length === 0 && !loading && (
                    <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                      No pipelines available. Configure Jenkins first.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : mode === 'create' ? 'Create & Link Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
