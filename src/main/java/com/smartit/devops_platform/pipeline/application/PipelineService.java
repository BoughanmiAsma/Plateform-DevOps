package com.smartit.devops_platform.pipeline.application;

import com.smartit.devops_platform.cicd.application.CiCdOrchestratorService;
import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import com.smartit.devops_platform.project.domain.model.Project;
import com.smartit.devops_platform.project.domain.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class PipelineService {

    private final CiCdOrchestratorService orchestrator;
    private final ProjectRepository projectRepository;

    public PipelineService(CiCdOrchestratorService orchestrator, ProjectRepository projectRepository) {
        this.orchestrator = orchestrator;
        this.projectRepository = projectRepository;
    }

    /**
     * 🎯 Use case principal : déclencher une exécution pipeline
     */
    public ExecutionPipeline triggerExecution(String projectId, String pipelineExternalId) {
        // 1. Charger l’agrégat
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 2. Récupérer pipeline
        Pipeline pipeline = project.getPipelineByExternalId(pipelineExternalId);

        // 3. Trigger via orchestrator
        String executionId = orchestrator.triggerPipeline(
                pipeline.getProvider(),
                pipeline.getName(),
                pipeline.getBranch() != null ? pipeline.getBranch() : "main",
                projectId
        );

        // 4. Créer execution métier
        ExecutionPipeline execution = new ExecutionPipeline(
                executionId,
                ExecutionStatus.RUNNING,
                LocalDateTime.now(),
                null,
                0
        );

        // 5. Ajouter au domaine
        pipeline.addExecution(execution);

        // 6. Sauvegarder agrégat
        projectRepository.save(project);

        return execution;
    }
}
