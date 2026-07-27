package com.smartit.devops_platform.docker.presentation;

import com.smartit.devops_platform.docker.application.DockerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/docker")
@RequiredArgsConstructor
@Slf4j
public class DockerController {

    private final DockerService dockerService;

    // ==================== CONTAINERS ====================

    @GetMapping("/containers")
    public List<Map<String, Object>> listContainers(
            @RequestParam(defaultValue = "true") boolean all) {
        return dockerService.listContainers(all);
    }

    @PostMapping("/containers/{id}/start")
    public ResponseEntity<Map<String, String>> startContainer(@PathVariable String id) {
        dockerService.startContainer(id);
        return ResponseEntity.ok(Map.of("message", "Container démarré: " + id));
    }

    @PostMapping("/containers/{id}/stop")
    public ResponseEntity<Map<String, String>> stopContainer(@PathVariable String id) {
        dockerService.stopContainer(id);
        return ResponseEntity.ok(Map.of("message", "Container arrêté: " + id));
    }

    @PostMapping("/containers/{id}/restart")
    public ResponseEntity<Map<String, String>> restartContainer(@PathVariable String id) {
        dockerService.restartContainer(id);
        return ResponseEntity.ok(Map.of("message", "Container redémarré: " + id));
    }

    @DeleteMapping("/containers/{id}")
    public ResponseEntity<Map<String, String>> removeContainer(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean force) {
        dockerService.removeContainer(id, force);
        return ResponseEntity.ok(Map.of("message", "Container supprimé: " + id));
    }

    @GetMapping("/containers/{id}/logs")
    public ResponseEntity<Map<String, String>> getContainerLogs(
            @PathVariable String id,
            @RequestParam(defaultValue = "100") int tail) {
        String logs = dockerService.getContainerLogs(id, tail);
        return ResponseEntity.ok(Map.of("logs", logs));
    }

    @GetMapping("/containers/{id}/stats")
    public Map<String, Object> getContainerStats(@PathVariable String id) {
        return dockerService.getContainerStats(id);
    }

    // ==================== IMAGES ====================

    @GetMapping("/images")
    public List<Map<String, Object>> listImages() {
        return dockerService.listImages();
    }

    @PostMapping("/images/pull")
    public ResponseEntity<Map<String, String>> pullImage(@RequestBody Map<String, String> body) throws InterruptedException {
        String imageName = body.getOrDefault("image", "");
        if (imageName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nom de l'image est obligatoire"));
        }
        dockerService.pullImage(imageName);
        return ResponseEntity.ok(Map.of("message", "Image tirée avec succès: " + imageName));
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<Map<String, String>> removeImage(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean force) {
        dockerService.removeImage(id, force);
        return ResponseEntity.ok(Map.of("message", "Image supprimée: " + id));
    }

    // ==================== VOLUMES ====================

    @GetMapping("/volumes")
    public List<Map<String, Object>> listVolumes() {
        return dockerService.listVolumes();
    }

    // ==================== NETWORKS ====================

    @GetMapping("/networks")
    public List<Map<String, Object>> listNetworks() {
        return dockerService.listNetworks();
    }
}
