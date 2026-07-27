package com.smartit.devops_platform.notification.domain.repository;

import com.smartit.devops_platform.notification.domain.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Retourne toutes les notifications triées par date décroissante (les plus récentes en premier).
     */
    List<Notification> findAllByOrderByCreatedAtDesc();

    /**
     * Retourne uniquement les notifications non lues.
     */
    List<Notification> findByReadFalseOrderByCreatedAtDesc();

    /**
     * Compte les notifications non lues (pour le badge de la cloche).
     */
    long countByReadFalse();
}
