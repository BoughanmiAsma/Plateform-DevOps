package com.smartit.devops_platform.notification.presentation;

import com.smartit.devops_platform.notification.application.NotificationService;
import com.smartit.devops_platform.notification.domain.model.Notification.NotificationSeverity;
import com.smartit.devops_platform.notification.domain.model.Notification.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Reçoit les alertes depuis Alertmanager (Prometheus).
 * Alertmanager envoie un POST JSON vers ce endpoint lorsqu'une règle se déclenche.
 *
 * Format du payload Alertmanager :
 * {
 *   "alerts": [
 *     {
 *       "status": "firing",
 *       "labels": { "alertname": "HighErrorRate", "severity": "critical" },
 *       "annotations": { "summary": "Taux d'erreur > 5%" }
 *     }
 *   ]
 * }
 */
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Slf4j
public class AlertWebhookController {

    private final NotificationService notificationService;

    /**
     * POST /api/alerts/webhook
     * Endpoint appelé par Alertmanager.
     */
    @PostMapping("/webhook")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> handleAlertmanagerWebhook(@RequestBody Map<String, Object> payload) {
        log.info("[Alertmanager] Webhook reçu: {}", payload);

        List<Map<String, Object>> alerts = (List<Map<String, Object>>) payload.get("alerts");
        if (alerts == null) return ResponseEntity.ok().build();

        for (Map<String, Object> alert : alerts) {
            String status = (String) alert.get("status");
            // On ne traite que les alertes "firing" (actives), pas "resolved"
            if (!"firing".equalsIgnoreCase(status)) continue;

            Map<String, String> labels      = (Map<String, String>) alert.get("labels");
            Map<String, String> annotations = (Map<String, String>) alert.get("annotations");

            String alertName = labels != null ? labels.getOrDefault("alertname", "Alerte Prometheus") : "Alerte";
            String severityStr = labels != null ? labels.getOrDefault("severity", "warning") : "warning";
            String summary = annotations != null ? annotations.getOrDefault("summary", "Alerte détectée") : "Alerte détectée";
            String description = annotations != null ? annotations.getOrDefault("description", "") : "";

            NotificationSeverity severity = switch (severityStr.toLowerCase()) {
                case "critical" -> NotificationSeverity.CRITICAL;
                case "warning"  -> NotificationSeverity.WARNING;
                default         -> NotificationSeverity.INFO;
            };

            String message = summary + (description.isBlank() ? "" : "\n" + description);

            notificationService.create(
                    NotificationType.PROMETHEUS,
                    severity,
                    "🔴 " + alertName,
                    message,
                    labels != null ? labels.get("job") : null
            );
        }

        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/alerts/jenkins
     * Endpoint appelé par Jenkins (via httpRequest dans Jenkinsfile) en cas d'échec.
     *
     * Payload attendu :
     * { "projectId": "...", "buildNumber": "42", "status": "FAILURE", "url": "http://..." }
     */
    @PostMapping("/jenkins")
    public ResponseEntity<Void> handleJenkinsAlert(@RequestBody Map<String, Object> payload) {
        log.info("[Jenkins] Alerte reçue: {}", payload);

        String projectId   = (String) payload.get("projectId");
        String buildNumber = String.valueOf(payload.getOrDefault("buildNumber", "?"));
        String status      = (String) payload.getOrDefault("status", "FAILURE");
        String url         = (String) payload.getOrDefault("url", "");

        if ("FAILURE".equalsIgnoreCase(status) || "UNSTABLE".equalsIgnoreCase(status)) {
            notificationService.create(
                    NotificationType.JENKINS,
                    NotificationSeverity.CRITICAL,
                    "❌ Pipeline échoué : " + projectId,
                    String.format("Build #%s du projet '%s' a échoué.\nConsulter : %s", buildNumber, projectId, url),
                    projectId
            );
        }

        return ResponseEntity.ok().build();
    }
}
