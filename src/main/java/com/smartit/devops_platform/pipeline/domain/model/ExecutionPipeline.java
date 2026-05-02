package com.smartit.devops_platform.pipeline.domain.model;

import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Objects;

@Getter
public class ExecutionPipeline {

    private final String executionId;
    private final ExecutionStatus status;
    private final int durationInSeconds;
    private final LocalDateTime startedAt;
    private final LocalDateTime finishedAt;

    public ExecutionPipeline(String executionId, ExecutionStatus status, LocalDateTime startedAt,
            LocalDateTime finishedAt, int durationInSeconds) {
        if (executionId == null || executionId.isBlank())
            throw new IllegalArgumentException("executionId is required");
        if (status == null)
            throw new IllegalArgumentException("status is required");

        this.executionId = executionId;
        this.status = status;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.durationInSeconds = durationInSeconds;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof ExecutionPipeline))
            return false;
        ExecutionPipeline that = (ExecutionPipeline) o;
        return Objects.equals(executionId, that.executionId);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(executionId);
    }
}
