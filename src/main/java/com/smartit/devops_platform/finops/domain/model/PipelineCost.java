package com.smartit.devops_platform.finops.domain.model;

public class PipelineCost {
    private String pipelineName;
    private int numberOfRuns;
    private long totalTimeSeconds;
    private double totalCost;
    private double wastedCost;

    public PipelineCost() {}

    public PipelineCost(String pipelineName, int numberOfRuns, long totalTimeSeconds, double totalCost, double wastedCost) {
        this.pipelineName = pipelineName;
        this.numberOfRuns = numberOfRuns;
        this.totalTimeSeconds = totalTimeSeconds;
        this.totalCost = totalCost;
        this.wastedCost = wastedCost;
    }

    public String getPipelineName() {
        return pipelineName;
    }

    public void setPipelineName(String pipelineName) {
        this.pipelineName = pipelineName;
    }

    public int getNumberOfRuns() {
        return numberOfRuns;
    }

    public void setNumberOfRuns(int numberOfRuns) {
        this.numberOfRuns = numberOfRuns;
    }

    public long getTotalTimeSeconds() {
        return totalTimeSeconds;
    }

    public void setTotalTimeSeconds(long totalTimeSeconds) {
        this.totalTimeSeconds = totalTimeSeconds;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public double getWastedCost() {
        return wastedCost;
    }

    public void setWastedCost(double wastedCost) {
        this.wastedCost = wastedCost;
    }
}
