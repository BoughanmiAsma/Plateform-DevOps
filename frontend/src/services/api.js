import keycloak from '../keycloak';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = (extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  if (keycloak.token) {
    headers['Authorization'] = `Bearer ${keycloak.token}`;
  }
  return headers;
};

export const api = {
  async getAllProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch projects');
    return await res.json();
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch project');
    return await res.json();
  },

  async createProject(name, repositoryUrl, k8sNamespace = null) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name, repositoryUrl, k8sNamespace })
    });
    if (!res.ok) throw new Error(await res.text() || 'Failed to create project');
    return await res.json();
  },

  async getJenkinsPipelines() {
    const res = await fetch(`${API_BASE_URL}/projects/jenkins-pipelines`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch Jenkins pipelines');
    return await res.json();
  },

  async associatePipelines(projectId, pipelineIds) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/pipelines`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ pipelineIds })
    });
    if (!res.ok) throw new Error(await res.text() || 'Failed to associate pipelines');
    return await res.json();
  },

  async runPipeline(projectId, pipelineExternalId, parameters = {}) {
    const res = await fetch(`${API_BASE_URL}/pipelines/run`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ projectId, pipelineExternalId, parameters })
    });
    if (!res.ok) throw new Error(await res.text() || 'Failed to run pipeline');
    return await res.json();
  },

  async getMetrics(metricName, minutes = 60) {
    let query = '';
    if (metricName === 'cpu') query = 'system_cpu_usage{namespace="immo-dev"}';
    else if (metricName === 'memory') query = 'jvm_memory_used_bytes{namespace="immo-dev"}';
    else if (metricName === 'rps') query = 'rate(http_server_requests_seconds_count{namespace="immo-dev"}[1m])';
    else if (metricName === 'errorRate') query = 'rate(http_server_requests_seconds_count{namespace="immo-dev",status=~"5.."}[1m])';
    else query = metricName;

    const res = await fetch(`${API_BASE_URL}/observability/metrics?query=${encodeURIComponent(query)}&minutes=${minutes}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch metrics');
    return await res.json();
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text() || 'Failed to delete project');
  },

  async getFinOpsSummary() {
    const res = await fetch(`${API_BASE_URL}/finops/summary`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch FinOps summary');
    return await res.json();
  },

  async getFinOpsRecommendations() {
    const res = await fetch(`${API_BASE_URL}/finops/recommendations`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch FinOps recommendations');
    return await res.json();
  },

  async getFinOpsProjectCost(projectId) {
    const res = await fetch(`${API_BASE_URL}/finops/projects/${projectId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch FinOps project cost');
    return await res.json();
  }
};
