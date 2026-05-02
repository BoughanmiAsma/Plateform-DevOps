package com.smartit.devops_platform.pipeline.domain.model;

import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
public class Pipeline {

    private final String externalId;
    private final String name;
    private final String branch;
    private final LocalDateTime syncedAt;
    private final ExecutionPipeline lastExecution;
    private final List<ExecutionPipeline> executions;
    private final CiCdProvider provider;

    private Pipeline(String externalId, String name, String branch, ExecutionPipeline lastExecution,
            List<ExecutionPipeline> executions, LocalDateTime syncedAt, CiCdProvider provider) {

        if (externalId == null) throw new IllegalArgumentException("Pipeline id required");

        this.externalId = externalId;
        this.name = name;
        this.branch = branch;
        this.syncedAt = syncedAt;
        this.lastExecution = lastExecution;
        this.executions = executions != null ? new ArrayList<>(executions) : new ArrayList<>();
        this.provider = provider;
    }

    // Factory method for creating an initial pipeline state
    public static Pipeline createPipeline(String externalId, String name, String branch, CiCdProvider provider) {
        return new Pipeline(externalId, name, branch, null, new ArrayList<>(), LocalDateTime.now(), provider);
    }

    public List<ExecutionPipeline> getExecutions() {
        return Collections.unmodifiableList(executions);
    }

    public void addExecution(ExecutionPipeline execution) {
        if (execution == null) {
            throw new IllegalArgumentException("Execution cannot be null");
        }
        this.executions.add(execution);
    }

    public void addOrUpdateExecution(ExecutionPipeline execution) {
        if (execution == null) {
            throw new IllegalArgumentException("Execution cannot be null");
        }
        
        // Supprimer l'ancienne version si elle existe
        this.executions.removeIf(e -> e.getExecutionId().equals(execution.getExecutionId()));
        this.executions.add(execution);
    }
}
