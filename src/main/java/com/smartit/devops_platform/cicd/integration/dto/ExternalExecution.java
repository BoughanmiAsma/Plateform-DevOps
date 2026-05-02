package com.smartit.devops_platform.cicd.integration.dto;

import java.time.LocalDateTime;

public class ExternalExecution {
    private String id;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private int duration;

    public ExternalExecution(String id, String status) {
        this.id = id;
        this.status = status;
        this.startedAt = LocalDateTime.now();
        this.finishedAt = null;
        this.duration = 0;
    }

    public ExternalExecution(String id, String status, LocalDateTime startedAt, LocalDateTime finishedAt, int duration) {
        this.id = id;
        this.status = status;
        this.startedAt = startedAt != null ? startedAt : LocalDateTime.now();
        this.finishedAt = finishedAt;
        this.duration = duration;
    }

    public String getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public int getDuration() {
        return duration;
    }
    
    // For backward compatibility with previous code if needed
    public LocalDateTime getTimestamp() {
        return startedAt;
    }
}
