package com.smartit.devops_platform.cicd.application;

import com.smartit.devops_platform.cicd.domain.enums.CiCdProvider;
import com.smartit.devops_platform.cicd.integration.dto.ExternalExecution;
import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;
import com.smartit.devops_platform.cicd.plugin.contract.CiCdPlugin;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CiCdOrchestratorService {

    private final Map<CiCdProvider, CiCdPlugin> plugins;

    public CiCdOrchestratorService(List<CiCdPlugin> pluginList) {
        this.plugins = pluginList.stream()
                .collect(Collectors.toMap(
                        CiCdPlugin::getProvider,
                        Function.identity()));
    }

    public String triggerPipeline(CiCdProvider provider, String pipelineName, String branch, String projectId) {
        CiCdPlugin plugin = plugins.get(provider);
        if (plugin == null) {
            throw new IllegalArgumentException("No plugin found for provider: " + provider);
        }
        return plugin.triggerPipeline(pipelineName, branch, projectId);
    }

    public List<ExternalPipeline> fetchPipelines(CiCdProvider provider) {
        return plugins.get(provider).fetchPipelines();
    }

    public List<ExternalExecution> fetchExecutions(CiCdProvider provider, String pipelineName) {
        return plugins.get(provider).fetchExecutions(pipelineName);
    }
}
