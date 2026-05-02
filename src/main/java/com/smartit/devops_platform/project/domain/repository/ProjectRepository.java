package com.smartit.devops_platform.project.domain.repository;

import com.smartit.devops_platform.project.domain.model.Project;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository {
    Optional<Project> findById(String projectId);
    List<Project> findAll();
    void save(Project project);
    void deleteById(String projectId);
}
