package com.smartit.devops_platform.project.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
public class ProjectEntity {
    @Id
    private UUID id;

    private String name;
    private String description;
    private String repositoryUrl;
    private String defaultBranch;
    private String environment;
    private String k8sNamespace;  // Kubernetes namespace for Prometheus metric queries
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PipelineEntity> pipelines = new ArrayList<>();
}
