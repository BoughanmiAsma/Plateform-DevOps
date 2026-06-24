package com.smartit.devops_platform.project.application;

import com.smartit.devops_platform.cicd.application.CiCdOrchestratorService;
import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;
import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import com.smartit.devops_platform.project.domain.model.Project;
import com.smartit.devops_platform.project.domain.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CiCdOrchestratorService orchestratorService;

    public Project createProject(String name, String repositoryUrl) {
        Project project = new Project(UUID.randomUUID(), name, repositoryUrl);
        projectRepository.save(project);
        return project;
    }

    public List<ExternalPipeline> fetchPipelinesFromJenkins() {
        return orchestratorService.fetchPipelines(CiCdProvider.JENKINS);
    }

    public Project associatePipelines(String projectId, List<String> pipelineIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        List<Pipeline> newPipelines = pipelineIds.stream()
                .map(id -> Pipeline.createPipeline(id, id, "main", CiCdProvider.JENKINS))
                .collect(Collectors.toList());

        project.syncPipeline(newPipelines);
        projectRepository.save(project);
        
        return project;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }
}
