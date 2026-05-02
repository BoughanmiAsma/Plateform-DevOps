package com.smartit.devops_platform.cicd.integration.mapper;

import org.springframework.stereotype.Component;

import com.smartit.devops_platform.cicd.integration.dto.ExternalExecution;
import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;

@Component
public class JenkinsMapper {
    // Normalization logic: Jenkins format -> Standard format

     public static ExecutionPipeline toDomain(ExternalExecution ext) {

        return new ExecutionPipeline(
                ext.getId(),
                mapStatus(ext.getStatus()),
                ext.getStartedAt(),
                ext.getFinishedAt(),
                ext.getDuration()
        );
    }

    private static ExecutionStatus mapStatus(String status) {
        if (status == null) return ExecutionStatus.RUNNING;
        return switch (status.toUpperCase()) {
            case "SUCCESS" -> ExecutionStatus.SUCCESS;
            case "FAILED", "FAIL" -> ExecutionStatus.FAILED;
            case "ABORTED", "CANCELLED" -> ExecutionStatus.CANCELLED;
            default -> ExecutionStatus.RUNNING;
        };
    }
}
