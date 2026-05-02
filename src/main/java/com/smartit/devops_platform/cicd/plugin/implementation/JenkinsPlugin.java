package com.smartit.devops_platform.cicd.plugin.implementation;

import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import com.smartit.devops_platform.cicd.integration.connector.JenkinsConnector;
import com.smartit.devops_platform.cicd.integration.dto.ExternalExecution;
import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;
import com.smartit.devops_platform.cicd.plugin.contract.CiCdPlugin;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JenkinsPlugin implements CiCdPlugin {

    private final JenkinsConnector jenkinsConnector;

    @Override
    public CiCdProvider getProvider() {
        return CiCdProvider.JENKINS;
    }

    @Override
    public String triggerPipeline(String pipelineName, String branch, String projectId) {
        return jenkinsConnector.triggerJob(pipelineName, branch, projectId);
    }

    @Override
    public List<ExternalPipeline> fetchPipelines() {
        return jenkinsConnector.getJobs();
    }

    @Override
    public List<ExternalExecution> fetchExecutions(String jobName) {
        return jenkinsConnector.getBuilds(jobName);
    }
}
