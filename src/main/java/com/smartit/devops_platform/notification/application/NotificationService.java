package com.smartit.devops_platform.notification.application;

import com.smartit.devops_platform.notification.domain.model.Notification;
import com.smartit.devops_platform.notification.domain.model.Notification.NotificationSeverity;
import com.smartit.devops_platform.notification.domain.model.Notification.NotificationType;
import com.smartit.devops_platform.notification.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;

    /**
     * Crée et persiste une nouvelle notification.
     */
    @Transactional
    public Notification create(NotificationType type, NotificationSeverity severity,
                               String title, String message, String projectId) {
        Notification notification = Notification.builder()
                .type(type)
                .severity(severity)
                .title(title)
                .message(message)
                .projectId(projectId)
                .read(false)
                .build();
        Notification saved = repository.save(notification);
        log.info("[Notification] Nouvelle notification créée: [{}] {} - {}", severity, title, projectId);
        return saved;
    }

    /**
     * Retourne toutes les notifications (les plus récentes en premier).
     */
    @Transactional(readOnly = true)
    public List<Notification> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Retourne uniquement les non-lues.
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnread() {
        return repository.findByReadFalseOrderByCreatedAtDesc();
    }

    /**
     * Nombre de notifications non lues (pour le badge).
     */
    @Transactional(readOnly = true)
    public long countUnread() {
        return repository.countByReadFalse();
    }

    /**
     * Marque une notification comme lue.
     */
    @Transactional
    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    /**
     * Marque toutes les notifications comme lues.
     */
    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = repository.findByReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
        log.info("[Notification] {} notification(s) marquée(s) comme lue(s).", unread.size());
    }
}
