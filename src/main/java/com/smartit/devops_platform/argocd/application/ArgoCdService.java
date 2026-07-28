package com.smartit.devops_platform.argocd.application;

import io.fabric8.kubernetes.api.model.GenericKubernetesResource;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import io.fabric8.kubernetes.client.dsl.base.CustomResourceDefinitionContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class ArgoCdService {

    private final CustomResourceDefinitionContext appCrdContext = new CustomResourceDefinitionContext.Builder()
            .withGroup("argoproj.io")
            .withVersion("v1alpha1")
            .withPlural("applications")
            .withScope("Namespaced")
            .build();

    public List<Map<String, Object>> getDeployments() {
        List<Map<String, Object>> deployments = new ArrayList<>();
        try (KubernetesClient client = new KubernetesClientBuilder().build()) {
            List<GenericKubernetesResource> items = client.genericKubernetesResources(appCrdContext)
                    .inNamespace("argocd")
                    .list()
                    .getItems();

            for (GenericKubernetesResource item : items) {
                Map<String, Object> deployment = new LinkedHashMap<>();
                deployment.put("name", item.getMetadata().getName());
                deployment.put("namespace", item.getMetadata().getNamespace());
                deployment.put("uid", item.getMetadata().getUid());
                
                Map<String, Object> status = (Map<String, Object>) item.getAdditionalProperties().get("status");

                // Target destination namespace (ex: immo-dev)
                String destinationNamespace = null;
                Map<String, Object> spec = (Map<String, Object>) item.getAdditionalProperties().get("spec");
                if (spec != null) {
                    Map<String, Object> destination = (Map<String, Object>) spec.get("destination");
                    if (destination != null && destination.get("namespace") != null) {
                        destinationNamespace = destination.get("namespace").toString();
                    }
                }
                if (destinationNamespace == null && status != null) {
                    Map<String, Object> sync = (Map<String, Object>) status.get("sync");
                    if (sync != null) {
                        Map<String, Object> comparedTo = (Map<String, Object>) sync.get("comparedTo");
                        if (comparedTo != null) {
                            Map<String, Object> dest = (Map<String, Object>) comparedTo.get("destination");
                            if (dest != null && dest.get("namespace") != null) {
                                destinationNamespace = dest.get("namespace").toString();
                            }
                        }
                    }
                }
                if (destinationNamespace == null) {
                    destinationNamespace = item.getMetadata().getNamespace();
                }
                deployment.put("destinationNamespace", destinationNamespace);

                // Extraction du status
                if (status != null) {
                    deployment.put("reconciledAt", status.get("reconciledAt"));
                    
                    // Sync status
                    Map<String, Object> sync = (Map<String, Object>) status.get("sync");
                    if (sync != null) {
                        deployment.put("syncStatus", sync.get("status"));
                        deployment.put("revision", sync.get("revision"));
                    } else {
                        deployment.put("syncStatus", "Unknown");
                    }

                    // Health status
                    Map<String, Object> health = (Map<String, Object>) status.get("health");
                    if (health != null) {
                        deployment.put("healthStatus", health.get("status"));
                    } else {
                        deployment.put("healthStatus", "Unknown");
                    }

                    // Summary images
                    Map<String, Object> summary = (Map<String, Object>) status.get("summary");
                    if (summary != null && summary.get("images") != null) {
                        deployment.put("images", summary.get("images"));
                    } else {
                        deployment.put("images", List.of());
                    }
                } else {
                    deployment.put("syncStatus", "Unknown");
                    deployment.put("healthStatus", "Unknown");
                    deployment.put("images", List.of());
                }
                
                deployments.add(deployment);
            }
        } catch (Exception e) {
            log.error("[ArgoCD] Erreur lors de la récupération des applications", e);
        }
        return deployments;
    }
}
