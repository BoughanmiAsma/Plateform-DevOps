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
  },

  // ---- Notifications ----
  async getNotifications() {
    // Endpoint public : pas besoin de JWT
    const res = await fetch(`${API_BASE_URL}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json(); // { notifications: [...], unreadCount: N }
  },

  async markNotificationRead(id) {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead() {
    await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT' });
  },

  // ---- Docker ----
  async getDockerContainers(all = true) {
    const res = await fetch(`${API_BASE_URL}/docker/containers?all=${all}`);
    if (!res.ok) throw new Error('Failed to fetch Docker containers');
    return await res.json();
  },

  async startDockerContainer(id) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start container');
    return await res.json();
  },

  async stopDockerContainer(id) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}/stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop container');
    return await res.json();
  },

  async restartDockerContainer(id) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}/restart`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to restart container');
    return await res.json();
  },

  async removeDockerContainer(id, force = false) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}?force=${force}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove container');
    return await res.json();
  },

  async getDockerContainerLogs(id, tail = 100) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}/logs?tail=${tail}`);
    if (!res.ok) throw new Error('Failed to fetch container logs');
    return await res.json();
  },

  async getDockerContainerStats(id) {
    const res = await fetch(`${API_BASE_URL}/docker/containers/${id}/stats`);
    if (!res.ok) throw new Error('Failed to fetch container stats');
    return await res.json();
  },

  async getDockerImages() {
    const res = await fetch(`${API_BASE_URL}/docker/images`);
    if (!res.ok) throw new Error('Failed to fetch Docker images');
    return await res.json();
  },

  async pullDockerImage(imageName) {
    const res = await fetch(`${API_BASE_URL}/docker/images/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageName })
    });
    if (!res.ok) throw new Error('Failed to pull Docker image');
    return await res.json();
  },

  async removeDockerImage(id, force = false) {
    const res = await fetch(`${API_BASE_URL}/docker/images/${id}?force=${force}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove Docker image');
    return await res.json();
  },

  async getDockerVolumes() {
    const res = await fetch(`${API_BASE_URL}/docker/volumes`);
    if (!res.ok) throw new Error('Failed to fetch Docker volumes');
    return await res.json();
  },

  async getDockerNetworks() {
    const res = await fetch(`${API_BASE_URL}/docker/networks`);
    if (!res.ok) throw new Error('Failed to fetch Docker networks');
    return await res.json();
  }
};

