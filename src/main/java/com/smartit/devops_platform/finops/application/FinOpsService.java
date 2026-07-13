package com.smartit.devops_platform.finops.application;

import com.smartit.devops_platform.finops.domain.model.*;
import com.smartit.devops_platform.observability.plugin.contract.ObservabilityPlugin;
import com.smartit.devops_platform.project.application.ProjectService;
import com.smartit.devops_platform.project.domain.model.Project;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FinOpsService {

    private final ObservabilityPlugin observabilityPlugin;
    private final ProjectService projectService;

    // Default rates
    private static final double CPU_COST_PER_CORE_HOUR = 0.04;
    private static final double RAM_COST_PER_GB_HOUR = 0.01;
    private static final double PIPELINE_COST_PER_SECOND = 0.003;

    public FinOpsService(ObservabilityPlugin observabilityPlugin, ProjectService projectService) {
        this.observabilityPlugin = observabilityPlugin;
        this.projectService = projectService;
    }

    public CostSummary getCostSummary() {
        List<ProjectCost> projects = new ArrayList<>();
        
        List<Project> realProjects = projectService.getAllProjects();
        for (Project proj : realProjects) {
            // Use k8sNamespace if set, fallback to project name
            String namespace = (proj.getK8sNamespace() != null && !proj.getK8sNamespace().isBlank())
                ? proj.getK8sNamespace() : proj.getName();
            projects.add(getProjectCost(proj.getName(), namespace));
        }

        double totalInfraCost = projects.stream().mapToDouble(ProjectCost::getInfraCost).sum();
        double totalPipelineCost = projects.stream().mapToDouble(ProjectCost::getPipelineCost).sum();
        double totalCost = totalInfraCost + totalPipelineCost;
        
        double estimatedSavings = projects.stream()
            .flatMap(p -> p.getRecommendations().stream())
            .mapToDouble(CostRecommendation::getEstimatedMonthlySavings)
            .sum();

        return new CostSummary(totalCost, totalPipelineCost, totalInfraCost, estimatedSavings, projects);
    }

    public ProjectCost getProjectCost(String projectId) {
        // Look up k8sNamespace from DB if project exists
        String namespace = projectService.getAllProjects().stream()
            .filter(p -> p.getName().equals(projectId) || p.getId().toString().equals(projectId))
            .findFirst()
            .map(p -> (p.getK8sNamespace() != null && !p.getK8sNamespace().isBlank()) ? p.getK8sNamespace() : p.getName())
            .orElse(projectId);
        return getProjectCost(projectId, namespace);
    }

    private ProjectCost getProjectCost(String projectName, String k8sNamespace) {
        // Query Prometheus with the real Kubernetes namespace
        Double cpuRaw = getMetricValueOrNull("avg_over_time(system_cpu_usage{namespace=\"" + k8sNamespace + "\"}[1h])");
        Double ramRaw = getMetricValueOrNull("avg_over_time(jvm_memory_used_bytes{namespace=\"" + k8sNamespace + "\"}[1h])");

        boolean hasMetrics = (cpuRaw != null || ramRaw != null);
        
        double cpuAvgCores = (cpuRaw != null) ? cpuRaw : 0.0;
        double ramAvgGb = (ramRaw != null) ? ramRaw / (1024.0 * 1024.0 * 1024.0) : 0.0;

        // Only calculate infra cost if real metrics exist
        double infraCost = hasMetrics
            ? (cpuAvgCores * CPU_COST_PER_CORE_HOUR * 720) + (ramAvgGb * RAM_COST_PER_GB_HOUR * 720)
            : 0.0;

        // Simulate Pipeline Cost (CI/CD builds)
        PipelineCost pipelineCostData = simulatePipelineCost(projectName);
        double pipelineCost = pipelineCostData.getTotalCost();

        List<CostRecommendation> recommendations = new ArrayList<>();

        // Only generate recommendations if we actually have real metric data
        if (hasMetrics) {
            // CPU overprovisioning: only if real CPU is very low AND above 0
            if (cpuRaw != null && cpuAvgCores > 0 && cpuAvgCores < 0.05) {
                double savings = (0.5 - cpuAvgCores) * CPU_COST_PER_CORE_HOUR * 720;
                recommendations.add(new CostRecommendation(
                    CostRecommendation.Type.OVERPROVISIONED_CPU,
                    "Surprovisionnement CPU",
                    "La consommation CPU du projet " + projectName + " est tr\u00e8s faible ("
                        + String.format("%.4f", cpuAvgCores) + " cores). Envisagez de r\u00e9duire les limites CPU demand\u00e9es.",
                    savings,
                    CostRecommendation.Severity.MEDIUM
                ));
            }
            // RAM overprovisioning
            if (ramRaw != null && ramAvgGb > 0 && ramAvgGb < 0.2) {
                double savings = (0.5 - ramAvgGb) * RAM_COST_PER_GB_HOUR * 720;
                recommendations.add(new CostRecommendation(
                    CostRecommendation.Type.OVERPROVISIONED_MEMORY,
                    "Surprovisionnement M\u00e9moire",
                    "La consommation RAM du projet " + projectName + " est tr\u00e8s faible ("
                        + String.format("%.2f", ramAvgGb * 1024) + " MB). Envisagez de r\u00e9duire la m\u00e9moire allou\u00e9e.",
                    savings,
                    CostRecommendation.Severity.LOW
                ));
            }
        }

        // Pipeline waste recommendation (independent of Prometheus)
        if (pipelineCostData.getWastedCost() > 5.0) {
            recommendations.add(new CostRecommendation(
                CostRecommendation.Type.PIPELINE_WASTE,
                "Gaspillage CI/CD",
                "Co\u00fbt \u00e9lev\u00e9 li\u00e9 aux pipelines \u00e9chou\u00e9s pour " + projectName + ". Optimisez les tests ou activez le cache de build.",
                pipelineCostData.getWastedCost(),
                CostRecommendation.Severity.HIGH
            ));
        }

        return new ProjectCost(projectName, infraCost + pipelineCost, infraCost, pipelineCost, recommendations);
    }
    
    private PipelineCost simulatePipelineCost(String projectId) {
        int runs = (int) (Math.random() * 50) + 10;
        long totalTimeSeconds = runs * 120L;
        double totalCost = totalTimeSeconds * PIPELINE_COST_PER_SECOND;
        double wastedCost = totalCost * (Math.random() * 0.3); // up to 30% waste
        return new PipelineCost(projectId + "-pipeline", runs, totalTimeSeconds, totalCost, wastedCost);
    }

    /**
     * Returns the metric value from Prometheus, or null if no data is available.
     * Null means the project has no running pods / metrics in Kubernetes.
     */
    private Double getMetricValueOrNull(String query) {
        try {
            Double value = observabilityPlugin.getInstantValue(query);
            if (value == null || value.isNaN()) return null;
            return value;
        } catch (Exception e) {
            return null;
        }
    }
}
