package com.smartit.devops_platform.project.application.dto;

import lombok.Data;

@Data
public class CreateProjectRequest {
    private String name;
    private String repositoryUrl;
}
