package com.smartit.devops_platform.project.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_pipelines")
@Data
public class ExecutionPipelineEntity {
    @Id
    private String executionId;

    private String status;
    private int durationInSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PipelineEntity pipeline;
}
