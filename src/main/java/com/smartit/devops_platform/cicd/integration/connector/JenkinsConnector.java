package com.smartit.devops_platform.cicd.integration.connector;

import com.fasterxml.jackson.databind.JsonNode;
import com.smartit.devops_platform.cicd.integration.dto.ExternalExecution;
import com.smartit.devops_platform.cicd.integration.dto.ExternalPipeline;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JenkinsConnector {
    
    private final RestTemplate restTemplate;

    @Value("${jenkins.base-url:http://localhost:8085}")
    private String baseUrl;

    @Value("${jenkins.username:admin}")
    private String username;

    @Value("${jenkins.api-token:dummy-token}")
    private String apiToken;

    public String triggerJob(String jobName, String branch, String projectId) {
        String url = baseUrl + "/job/" + jobName + "/buildWithParameters";
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        // On passe la branche ET l'ID du projet à Jenkins
        String body = "BRANCH=" + branch + "&PROJECT_ID=" + projectId;
        
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        restTemplate.exchange(url, HttpMethod.POST, request, Void.class);
        
        // On génère un ID unique pour cette exécution précise
        return java.util.UUID.randomUUID().toString(); 
    }
    
    public List<ExternalPipeline> getJobs() {
        String url = baseUrl + "/api/json?tree=jobs[name]";
        HttpEntity<String> request = new HttpEntity<>(createHeaders());
        
        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, request, JsonNode.class);
            JsonNode body = response.getBody();
            if (body != null && body.has("jobs")) {
                List<ExternalPipeline> pipelines = new ArrayList<>();
                for (JsonNode job : body.get("jobs")) {
                    String name = job.get("name").asText();
                    pipelines.add(new ExternalPipeline(name, name));
                }
                return pipelines;
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch jobs from Jenkins: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    public List<ExternalExecution> getBuilds(String jobName) {
        String url = baseUrl + "/job/" + jobName + "/api/json?tree=builds[id,result,timestamp,duration]";
        HttpEntity<String> request = new HttpEntity<>(createHeaders());
        
        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, request, JsonNode.class);
            JsonNode body = response.getBody();
            if (body != null && body.has("builds")) {
                List<ExternalExecution> executions = new ArrayList<>();
                for (JsonNode build : body.get("builds")) {
                    String id = build.get("id").asText();
                    String status = build.hasNonNull("result") ? build.get("result").asText() : "RUNNING";
                    
                    long timestampMs = build.get("timestamp").asLong();
                    int durationMs = build.hasNonNull("duration") ? build.get("duration").asInt() : 0;
                    
                    LocalDateTime startedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestampMs), ZoneId.systemDefault());
                    LocalDateTime finishedAt = durationMs > 0 ? startedAt.plusNanos((long) durationMs * 1_000_000) : null;
                    
                    executions.add(new ExternalExecution(id, status, startedAt, finishedAt, durationMs / 1000));
                }
                return executions;
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch builds for job " + jobName + ": " + e.getMessage());
        }
        return Collections.emptyList();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = username + ":" + apiToken;
        String encoded = java.util.Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encoded);
        return headers;
    }
}
