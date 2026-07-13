package com.smartit.devops_platform.project.infrastructure.persistence.mapper;

import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import com.smartit.devops_platform.project.domain.enums.ProjectEnvironment;
import com.smartit.devops_platform.project.domain.model.Project;
import com.smartit.devops_platform.project.infrastructure.persistence.entity.ExecutionPipelineEntity;
import com.smartit.devops_platform.project.infrastructure.persistence.entity.PipelineEntity;
import com.smartit.devops_platform.project.infrastructure.persistence.entity.ProjectEntity;

import java.util.List;
import java.util.stream.Collectors;

public class ProjectMapper {

    public static Project toDomain(ProjectEntity entity) {
        if (entity == null) return null;

        Project project = new Project(entity.getId(), entity.getName(), entity.getRepositoryUrl());
        project.updateInfo(entity.getName(), entity.getDescription());
        if (entity.getDefaultBranch() != null) {
            project.chageDefaultBranch(entity.getDefaultBranch());
        }
        if (entity.getEnvironment() != null) {
            project.changeEnvironment(ProjectEnvironment.valueOf(entity.getEnvironment()));
        }
        if (entity.getK8sNamespace() != null) {
            project.setK8sNamespace(entity.getK8sNamespace());
        }
        if (!entity.isActive()) project.deactivate();

        if (entity.getPipelines() != null) {
            List<Pipeline> pipelines = entity.getPipelines().stream()
                .map(ProjectMapper::toDomainPipeline)
                .collect(Collectors.toList());
            project.syncPipeline(pipelines);
        }

        return project;
    }

    private static Pipeline toDomainPipeline(PipelineEntity entity) {
        Pipeline pipeline = Pipeline.createPipeline(
                entity.getExternalId(),
                entity.getName(),
                entity.getBranch(),
                CiCdProvider.valueOf(entity.getProvider())
        );
        if (entity.getExecutions() != null) {
            for (ExecutionPipelineEntity execEntity : entity.getExecutions()) {
                pipeline.addExecution(toDomainExecution(execEntity));
            }
        }
        return pipeline;
    }

    private static ExecutionPipeline toDomainExecution(ExecutionPipelineEntity entity) {
        return new ExecutionPipeline(
                entity.getExecutionId(),
                ExecutionStatus.valueOf(entity.getStatus()),
                entity.getStartedAt(),
                entity.getFinishedAt(),
                entity.getDurationInSeconds()
        );
    }

    public static ProjectEntity toEntity(Project domain) {
        if (domain == null) return null;

        ProjectEntity entity = new ProjectEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setRepositoryUrl(domain.getRepositoryUrl());
        entity.setDefaultBranch(domain.getDefaultBranch());
        entity.setEnvironment(domain.getEnvironment() != null ? domain.getEnvironment().name() : null);
        entity.setActive(domain.isActive());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setK8sNamespace(domain.getK8sNamespace());

        if (domain.getPipelines() != null) {
            List<PipelineEntity> pipelineEntities = domain.getPipelines().stream()
                    .map(p -> toEntityPipeline(p, entity))
                    .collect(Collectors.toList());
            entity.setPipelines(pipelineEntities);
        }

        return entity;
    }

    private static PipelineEntity toEntityPipeline(Pipeline domain, ProjectEntity projectEntity) {
        PipelineEntity entity = new PipelineEntity();
        entity.setExternalId(domain.getExternalId());
        entity.setName(domain.getName());
        entity.setBranch(domain.getBranch());
        entity.setSyncedAt(domain.getSyncedAt());
        entity.setProvider(domain.getProvider().name());
        entity.setProject(projectEntity);

        if (domain.getExecutions() != null) {
            List<ExecutionPipelineEntity> execEntities = domain.getExecutions().stream()
                    .map(e -> toEntityExecution(e, entity))
                    .collect(Collectors.toList());
            entity.setExecutions(execEntities);
        }

        return entity;
    }

    private static ExecutionPipelineEntity toEntityExecution(ExecutionPipeline domain, PipelineEntity pipelineEntity) {
        ExecutionPipelineEntity entity = new ExecutionPipelineEntity();
        entity.setExecutionId(domain.getExecutionId());
        entity.setStatus(domain.getStatus().name());
        entity.setDurationInSeconds(domain.getDurationInSeconds());
        entity.setStartedAt(domain.getStartedAt());
        entity.setFinishedAt(domain.getFinishedAt());
        entity.setPipeline(pipelineEntity);
        return entity;
    }
}
