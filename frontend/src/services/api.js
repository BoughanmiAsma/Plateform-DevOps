const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  // Récupérer tous les projets
  async getAllProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch projects');
    }
    return await res.json();
  },

  // Récupérer un projet spécifique
  async getProject(id) {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch project');
    }
    return await res.json();
  },

  // Créer un projet
  async createProject(name, repositoryUrl) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, repositoryUrl })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to create project');
    }
    return await res.json();
  },

  // Récupérer les pipelines Jenkins disponibles depuis le backend
  async getJenkinsPipelines() {
    const res = await fetch(`${API_BASE_URL}/projects/jenkins-pipelines`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch Jenkins pipelines');
    }
    return await res.json();
  },

  // Associer des pipelines à un projet
  async associatePipelines(projectId, pipelineIds) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/pipelines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineIds })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to associate pipelines');
    }
    return await res.json();
  },

  // Exécuter un pipeline
  async runPipeline(projectId, pipelineExternalId, parameters = {}) {
    const res = await fetch(`${API_BASE_URL}/pipelines/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, pipelineExternalId, parameters })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to run pipeline');
    }
    return await res.json();
  },

  // Récupérer les métriques réelles d'observabilité (Prometheus)
  async getMetrics(metricName, minutes = 60) {
    let query = '';
    if (metricName === 'cpu') {
      // Requête Prometheus pour le CPU
      query = 'system_cpu_usage';
    } else if (metricName === 'memory') {
      // Requête Prometheus pour la JVM Memory
      query = 'jvm_memory_used_bytes';
    } else if (metricName === 'rps') {
      // Requête Prometheus pour Requests Per Second
      query = 'http_server_requests_seconds_count';
    } else if (metricName === 'errorRate') {
      // Requête Prometheus pour Taux d'erreurs
      query = 'http_server_requests_seconds_count{status=~"5.."}';
    } else {
      query = metricName;
    }

    const res = await fetch(`${API_BASE_URL}/observability/metrics?query=${encodeURIComponent(query)}&minutes=${minutes}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch metrics');
    }
    return await res.json();
  }
};
