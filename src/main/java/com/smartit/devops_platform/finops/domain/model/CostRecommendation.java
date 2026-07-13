package com.smartit.devops_platform.finops.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CostRecommendation {
    public enum Type {
        OVERPROVISIONED_CPU,
        OVERPROVISIONED_MEMORY,
        PIPELINE_WASTE,
        IDLE_RESOURCES
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH
    }

    private Type type;
    private String title;
    private String description;
    private double estimatedMonthlySavings;
    private Severity severity;
}
