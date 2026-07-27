package com.smartit.devops_platform.notification.presentation;

import com.smartit.devops_platform.notification.application.NotificationService;
import com.smartit.devops_platform.notification.domain.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    /**
     * GET /api/notifications
     * Retourne toutes les notifications (du plus récent au plus ancien).
     * Inclut aussi le compte des non-lues pour le badge.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<Notification> notifications = service.getAll();
        long unreadCount = service.countUnread();
        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount
        ));
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marque une notification spécifique comme lue.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/notifications/read-all
     * Marque toutes les notifications comme lues.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        service.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}
