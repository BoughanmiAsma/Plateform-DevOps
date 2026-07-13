package com.smartit.devops_platform.finops.domain.model;

import java.util.List;

public class CostSummary {
    private double totalCost;
    private double totalPipelineCost;
    private double totalInfraCost;
    private double estimatedSavings;
    private List<ProjectCost> projectCosts;

    public CostSummary() {}

    public CostSummary(double totalCost, double totalPipelineCost, double totalInfraCost, double estimatedSavings, List<ProjectCost> projectCosts) {
        this.totalCost = totalCost;
        this.totalPipelineCost = totalPipelineCost;
        this.totalInfraCost = totalInfraCost;
        this.estimatedSavings = estimatedSavings;
        this.projectCosts = projectCosts;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public double getTotalPipelineCost() {
        return totalPipelineCost;
    }

    public void setTotalPipelineCost(double totalPipelineCost) {
        this.totalPipelineCost = totalPipelineCost;
    }

    public double getTotalInfraCost() {
        return totalInfraCost;
    }

    public void setTotalInfraCost(double totalInfraCost) {
        this.totalInfraCost = totalInfraCost;
    }

    public double getEstimatedSavings() {
        return estimatedSavings;
    }

    public void setEstimatedSavings(double estimatedSavings) {
        this.estimatedSavings = estimatedSavings;
    }

    public List<ProjectCost> getProjectCosts() {
        return projectCosts;
    }

    public void setProjectCosts(List<ProjectCost> projectCosts) {
        this.projectCosts = projectCosts;
    }
}
