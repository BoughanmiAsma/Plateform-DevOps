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
  async createProject(name, repositoryUrl, k8sNamespace = null) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, repositoryUrl, k8sNamespace })
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
      query = 'system_cpu_usage{namespace="immo-dev"}';
    } else if (metricName === 'memory') {
      query = 'jvm_memory_used_bytes{namespace="immo-dev"}';
    } else if (metricName === 'rps') {
      query = 'rate(http_server_requests_seconds_count{namespace="immo-dev"}[1m])';
    } else if (metricName === 'errorRate') {
      query = 'rate(http_server_requests_seconds_count{namespace="immo-dev",status=~"5.."}[1m])';
    } else {
      query = metricName;
    }


    const res = await fetch(`${API_BASE_URL}/observability/metrics?query=${encodeURIComponent(query)}&minutes=${minutes}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch metrics');
    }
    return await res.json();
  },

  // Supprimer un projet
  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete project');
    }
  },

  // Récupérer la synthèse des coûts (FinOps)
  async getFinOpsSummary() {
    const res = await fetch(`${API_BASE_URL}/finops/summary`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch FinOps summary');
    }
    return await res.json();
  },

  // Récupérer les recommandations FinOps
  async getFinOpsRecommendations() {
    const res = await fetch(`${API_BASE_URL}/finops/recommendations`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch FinOps recommendations');
    }
    return await res.json();
  },

  // Récupérer les coûts FinOps d'un projet spécifique
  async getFinOpsProjectCost(projectId) {
    const res = await fetch(`${API_BASE_URL}/finops/projects/${projectId}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch FinOps project cost');
    }
    return await res.json();
  }
};
