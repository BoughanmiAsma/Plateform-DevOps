package com.smartit.devops_platform.cicd.plugin.contract;

import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import com.smartit.devops_platform.cicd.integration.dto.ExternalExecution;
import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;

import java.util.List;

public interface CiCdPlugin {
    CiCdProvider getProvider();
    String triggerPipeline(String pipelineName, String branch, String projectId, java.util.Map<String, String> parameters);
    List<ExternalPipeline> fetchPipelines();
    List<ExternalExecution> fetchExecutions(String pipelineName);
}
