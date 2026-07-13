package com.smartit.devops_platform.finops.domain.model;

import java.util.List;

public class ProjectCost {
    private String projectId;
    private double totalCost;
    private double infraCost;
    private double pipelineCost;
    private List<CostRecommendation> recommendations;

    public ProjectCost() {}

    public ProjectCost(String projectId, double totalCost, double infraCost, double pipelineCost, List<CostRecommendation> recommendations) {
        this.projectId = projectId;
        this.totalCost = totalCost;
        this.infraCost = infraCost;
        this.pipelineCost = pipelineCost;
        this.recommendations = recommendations;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public double getInfraCost() {
        return infraCost;
    }

    public void setInfraCost(double infraCost) {
        this.infraCost = infraCost;
    }

    public double getPipelineCost() {
        return pipelineCost;
    }

    public void setPipelineCost(double pipelineCost) {
        this.pipelineCost = pipelineCost;
    }

    public List<CostRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<CostRecommendation> recommendations) {
        this.recommendations = recommendations;
    }
}
