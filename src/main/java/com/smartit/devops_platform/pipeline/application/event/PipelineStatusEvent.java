package com.smartit.devops_platform.pipeline.application.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PipelineStatusEvent implements Serializable {
    private String projectId;
    private String pipelineId;
    private String executionId;
    private String status;
    private LocalDateTime finishedAt;
}
