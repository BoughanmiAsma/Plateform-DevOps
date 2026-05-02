package com.smartit.devops_platform.project.infrastructure.persistence;

import com.smartit.devops_platform.project.domain.model.Project;
import com.smartit.devops_platform.project.domain.repository.ProjectRepository;
import com.smartit.devops_platform.project.infrastructure.persistence.entity.ProjectEntity;
import com.smartit.devops_platform.project.infrastructure.persistence.mapper.ProjectMapper;
import com.smartit.devops_platform.project.infrastructure.persistence.repository.SpringDataProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProjectRepositoryImpl implements ProjectRepository {
    
    private final SpringDataProjectRepository jpaRepository;

    @Override
    public Optional<Project> findById(String id) {
        return jpaRepository.findById(UUID.fromString(id))
                .map(ProjectMapper::toDomain);
    }

    @Override
    public void save(Project project) {
        ProjectEntity entity = ProjectMapper.toEntity(project);
        jpaRepository.save(entity);
    }

    @Override
    public void deleteById(String projectId) {
        jpaRepository.deleteById(UUID.fromString(projectId));
    } 

    @Override
    public List<Project> findAll() {
        return jpaRepository.findAll().stream()
                .map(ProjectMapper::toDomain)
                .collect(Collectors.toList());
    }
}
