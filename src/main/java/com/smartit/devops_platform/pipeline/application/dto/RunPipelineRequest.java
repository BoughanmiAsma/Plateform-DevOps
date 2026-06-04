package com.smartit.devops_platform.pipeline.application.dto;

import lombok.Data;

@Data
public class RunPipelineRequest {
    private String projectId;
    private String pipelineExternalId;
    private String branch;
    private java.util.Map<String, String> parameters;
}
