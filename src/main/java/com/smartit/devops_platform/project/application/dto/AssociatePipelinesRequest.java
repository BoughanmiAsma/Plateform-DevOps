package com.smartit.devops_platform.project.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class AssociatePipelinesRequest {
    private List<String> pipelineIds;
}
