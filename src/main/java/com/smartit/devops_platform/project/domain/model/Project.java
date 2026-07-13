package com.smartit.devops_platform.project.domain.model;

import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import com.smartit.devops_platform.project.domain.enums.ProjectEnvironment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import lombok.Getter;

@Getter
public class Project {

    private final UUID id;
    private String name;
    private String description;
    private final String repositoryUrl;
    private String defaultBranch;
    private ProjectEnvironment environment;
    private boolean active;
    private String k8sNamespace; // Kubernetes namespace for Prometheus queries
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private final List<Pipeline> pipelines;

    public Project(UUID id, String name, String repositoryUrl) {
        if (id == null) throw new IllegalArgumentException("Project id is required");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Project name required");
        if (repositoryUrl == null || repositoryUrl.isBlank()) throw new IllegalArgumentException("Repository URL is required");

        this.id = id;
        this.name = name;
        this.repositoryUrl = repositoryUrl;
        this.defaultBranch = "main";
        this.environment = ProjectEnvironment.DEV;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.pipelines = new ArrayList<>();
    }

    public void active() {
        if (this.active) return;
        this.active = true;
        touch();
    }

    public void deactivate() {
        if (!this.active) return;
        this.active = false;
        touch();
    }

    public void updateInfo(String name, String description) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Project name cannot be empty");
        this.name = name;
        this.description = description;
        touch();
    }

    public void setK8sNamespace(String k8sNamespace) {
        this.k8sNamespace = k8sNamespace;
        touch();
    }

    public void chageDefaultBranch(String branch) {
        if (branch == null || branch.isBlank()) throw new IllegalArgumentException("Branch cannot be empty");
        this.defaultBranch = branch;
        touch();
    }

    public void changeEnvironment(ProjectEnvironment environment) {
        if (environment == null) throw new IllegalArgumentException("Environment cannot be null");
        this.environment = environment;
        touch();
    }

    public void syncPipeline(List<Pipeline> externalPipelines) {
        requiredActive();
        if (externalPipelines == null) throw new IllegalArgumentException("Pipelines cannot be null");

        Map<String, Pipeline> currentMap = new HashMap<>();
        for (Pipeline p : this.pipelines) {
            currentMap.put(p.getExternalId(), p);
        }

        List<Pipeline> updatedList = new ArrayList<>();
        for (Pipeline external : externalPipelines) {
            Pipeline existing = currentMap.get(external.getExternalId());
            if (existing == null) {
                updatedList.add(external);
            } else if (!existing.equals(external)) {
                updatedList.add(external);
            } else {
                updatedList.add(existing);
            }
        }

        this.pipelines.clear();
        this.pipelines.addAll(updatedList);
        touch();
    }

    public Pipeline getPipelineByExternalId(String externalId) {
        requiredActive();
        return pipelines.stream()
                .filter(p -> p.getExternalId().equals(externalId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Pipeline not found: " + externalId));
    }

    public List<Pipeline> getPipelines() {
        requiredActive();
        return Collections.unmodifiableList(pipelines);
    }

    public boolean hasExecution(String executionId) {
        requiredActive();
        for (Pipeline p : pipelines) {
            for (ExecutionPipeline e : p.getExecutions()) {
                if (e.getExecutionId().equals(executionId)) {
                    return true;
                }
            }
        }
        return false;
    }

    public void addExecutionToPipeline(String externalId, ExecutionPipeline execution) {
        requiredActive();
        Pipeline pipeline = getPipelineByExternalId(externalId);
        pipeline.addOrUpdateExecution(execution);
        touch();
    }

    private void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    private void requiredActive() {
        if (!active) throw new IllegalStateException("Project is inactive");
    }
}
