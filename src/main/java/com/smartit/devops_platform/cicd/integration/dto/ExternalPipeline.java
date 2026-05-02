package com.smartit.devops_platform.cicd.integration.dto;

public class ExternalPipeline {
    private String externalId;
    private String name;

    public ExternalPipeline(String externalId, String name) {
        this.externalId = externalId;
        this.name = name;
    }

    public String getExternalId() {
        return externalId;
    }

    public String getName() {
        return name;
    }
}
