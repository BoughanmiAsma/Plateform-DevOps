package com.smartit.devops_platform.notification.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Type de source : PROMETHEUS ou JENKINS
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    /**
     * Niveau de sévérité : INFO, WARNING, CRITICAL
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationSeverity severity;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    /**
     * Identifiant du projet concerné (optionnel)
     */
    private String projectId;

    /**
     * Lue ou non par l'ingénieur
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean read = false;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ---- Enums internes ----

    public enum NotificationType {
        PROMETHEUS, JENKINS
    }

    public enum NotificationSeverity {
        INFO, WARNING, CRITICAL
    }
}
