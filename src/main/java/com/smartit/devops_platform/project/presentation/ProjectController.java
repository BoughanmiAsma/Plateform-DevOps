package com.smartit.devops_platform.project.presentation;

import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;
import com.smartit.devops_platform.project.application.ProjectService;
import com.smartit.devops_platform.project.application.dto.AssociatePipelinesRequest;
import com.smartit.devops_platform.project.application.dto.CreateProjectRequest;
import com.smartit.devops_platform.project.domain.model.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Project createProject(@RequestBody CreateProjectRequest request) {
        return projectService.createProject(request.getName(), request.getRepositoryUrl());
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public Project getProject(@PathVariable String id) {
        return projectService.getProjectById(id);
    }

    @GetMapping("/jenkins-pipelines")
    public List<ExternalPipeline> fetchJenkinsPipelines() {
        return projectService.fetchPipelinesFromJenkins();
    }

    @PostMapping("/{id}/pipelines")
    public Project associatePipelines(@PathVariable String id, @RequestBody AssociatePipelinesRequest request) {
        return projectService.associatePipelines(id, request.getPipelineIds());
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
