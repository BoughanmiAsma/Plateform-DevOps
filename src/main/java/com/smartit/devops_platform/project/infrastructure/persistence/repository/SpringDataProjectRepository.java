package com.smartit.devops_platform.project.infrastructure.persistence.repository;

import com.smartit.devops_platform.project.infrastructure.persistence.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataProjectRepository extends JpaRepository<ProjectEntity, UUID> {
}
