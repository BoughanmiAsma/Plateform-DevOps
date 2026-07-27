package com.smartit.devops_platform.docker.application;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.api.command.InspectVolumeResponse;
import com.github.dockerjava.api.command.PullImageResultCallback;
import com.github.dockerjava.api.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DockerService {

    private final DockerClient dockerClient;

    // ==================== CONTAINERS ====================

    public List<Map<String, Object>> listContainers(boolean all) {
        List<Container> containers = dockerClient.listContainersCmd()
                .withShowAll(all)
                .exec();

        return containers.stream().map(c -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", c.getId().substring(0, 12));
            info.put("idFull", c.getId());
            info.put("names", Arrays.stream(c.getNames())
                    .map(n -> n.startsWith("/") ? n.substring(1) : n)
                    .collect(Collectors.toList()));
            info.put("image", c.getImage());
            info.put("state", c.getState());
            info.put("status", c.getStatus());
            info.put("created", c.getCreated());

            // Ports
            List<Map<String, Object>> ports = new ArrayList<>();
            if (c.getPorts() != null) {
                for (ContainerPort p : c.getPorts()) {
                    Map<String, Object> portInfo = new HashMap<>();
                    portInfo.put("privatePort", p.getPrivatePort());
                    portInfo.put("publicPort", p.getPublicPort());
                    portInfo.put("type", p.getType());
                    ports.add(portInfo);
                }
            }
            info.put("ports", ports);

            // Network
            if (c.getNetworkSettings() != null && c.getNetworkSettings().getNetworks() != null) {
                info.put("networks", c.getNetworkSettings().getNetworks().keySet());
            }

            return info;
        }).collect(Collectors.toList());
    }

    public void startContainer(String containerId) {
        log.info("[Docker] Démarrage du container: {}", containerId);
        dockerClient.startContainerCmd(containerId).exec();
    }

    public void stopContainer(String containerId) {
        log.info("[Docker] Arrêt du container: {}", containerId);
        dockerClient.stopContainerCmd(containerId).exec();
    }

    public void restartContainer(String containerId) {
        log.info("[Docker] Redémarrage du container: {}", containerId);
        dockerClient.restartContainerCmd(containerId).exec();
    }

    public void removeContainer(String containerId, boolean force) {
        log.info("[Docker] Suppression du container: {} (force={})", containerId, force);
        dockerClient.removeContainerCmd(containerId).withForce(force).exec();
    }

    public String getContainerLogs(String containerId, int tail) {
        StringBuilder logs = new StringBuilder();
        try {
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(true)
                    .withStdErr(true)
                    .withTail(tail)
                    .withTimestamps(true)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<Frame>() {
                        @Override
                        public void onNext(Frame frame) {
                            logs.append(new String(frame.getPayload()));
                        }
                    }).awaitCompletion();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Log retrieval interrupted for container: {}", containerId);
        }
        return logs.toString();
    }

    public Map<String, Object> getContainerStats(String containerId) {
        InspectContainerResponse inspect = dockerClient.inspectContainerCmd(containerId).exec();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("id", containerId.substring(0, Math.min(12, containerId.length())));
        stats.put("name", inspect.getName() != null ? inspect.getName().replaceFirst("^/", "") : "unknown");
        stats.put("state", inspect.getState() != null ? inspect.getState().getStatus() : "unknown");

        if (inspect.getState() != null && inspect.getState().getRunning() != null) {
            stats.put("running", inspect.getState().getRunning());
        }

        // Mounts / volumes
        if (inspect.getMounts() != null) {
            stats.put("mounts", inspect.getMounts().stream().map(m -> {
                Map<String, String> mount = new HashMap<>();
                mount.put("source", m.getSource());
                mount.put("destination", m.getDestination() != null ? m.getDestination().getPath() : "");
                mount.put("mode", m.getMode());
                return mount;
            }).collect(Collectors.toList()));
        }

        return stats;
    }

    // ==================== IMAGES ====================

    public List<Map<String, Object>> listImages() {
        List<Image> images = dockerClient.listImagesCmd().exec();
        return images.stream().map(img -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", img.getId() != null ? img.getId().replace("sha256:", "").substring(0, 12) : "n/a");
            info.put("idFull", img.getId());
            info.put("repoTags", img.getRepoTags() != null ? Arrays.asList(img.getRepoTags()) : List.of("<none>"));
            info.put("size", img.getSize());
            info.put("created", img.getCreated());
            return info;
        }).collect(Collectors.toList());
    }

    public void pullImage(String imageName) throws InterruptedException {
        log.info("[Docker] Pull de l'image: {}", imageName);
        String repo = imageName;
        String tag = "latest";
        if (imageName.contains(":")) {
            String[] parts = imageName.split(":");
            repo = parts[0];
            tag = parts[1];
        }
        dockerClient.pullImageCmd(repo)
                .withTag(tag)
                .exec(new PullImageResultCallback())
                .awaitCompletion();
        log.info("[Docker] Image tirée avec succès: {}", imageName);
    }

    public void removeImage(String imageId, boolean force) {
        log.info("[Docker] Suppression de l'image: {} (force={})", imageId, force);
        dockerClient.removeImageCmd(imageId).withForce(force).exec();
    }

    // ==================== VOLUMES ====================

    public List<Map<String, Object>> listVolumes() {
        var response = dockerClient.listVolumesCmd().exec();
        List<InspectVolumeResponse> volumes = response.getVolumes();
        if (volumes == null) return List.of();

        return volumes.stream().map(v -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("name", v.getName());
            info.put("driver", v.getDriver());
            info.put("mountpoint", v.getMountpoint());
            return info;
        }).collect(Collectors.toList());
    }

    // ==================== NETWORKS ====================

    public List<Map<String, Object>> listNetworks() {
        List<Network> networks = dockerClient.listNetworksCmd().exec();
        return networks.stream().map(n -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", n.getId().substring(0, 12));
            info.put("idFull", n.getId());
            info.put("name", n.getName());
            info.put("driver", n.getDriver());
            info.put("scope", n.getScope());

            // Connected containers
            if (n.getContainers() != null) {
                info.put("containers", n.getContainers().entrySet().stream().map(e -> {
                    Map<String, String> c = new HashMap<>();
                    c.put("id", e.getKey().substring(0, 12));
                    c.put("name", e.getValue().getName());
                    c.put("ipv4", e.getValue().getIpv4Address());
                    return c;
                }).collect(Collectors.toList()));
            } else {
                info.put("containers", List.of());
            }

            return info;
        }).collect(Collectors.toList());
    }
}
