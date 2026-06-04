package com.smartit.devops_platform.pipeline.infrastructure;

import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import com.smartit.devops_platform.project.domain.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Au démarrage du backend, nettoie toutes les exécutions "RUNNING" bloquées
 * (plus de 30 minutes d'âge) en les marquant comme FAILED.
 * Evite les statuts fantômes après un crash ou redémarrage du backend.
 */
@Component
@RequiredArgsConstructor
public class StuckExecutionCleanupRunner implements ApplicationRunner {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        int[] cleaned = {0};

        projectRepository.findAll().forEach(project -> {
            boolean modified = false;

            for (var pipeline : project.getPipelines()) {
                var stuckExecs = pipeline.getExecutions().stream()
                        .filter(e -> e.getStatus() == ExecutionStatus.RUNNING)
                        .filter(e -> e.getStartedAt() != null && e.getStartedAt().isBefore(cutoff))
                        .toList();

                for (var stuck : stuckExecs) {
                    LocalDateTime end = LocalDateTime.now();
                    int durationSecs = (int) java.time.Duration.between(stuck.getStartedAt(), end).getSeconds();

                    ExecutionPipeline cleaned_exec = new ExecutionPipeline(
                            stuck.getExecutionId(),
                            ExecutionStatus.FAILED,
                            stuck.getStartedAt(),
                            end,
                            durationSecs
                    );
                    pipeline.addOrUpdateExecution(cleaned_exec);
                    cleaned[0]++;
                    modified = true;
                    System.out.println("[Cleanup] Exécution bloquée nettoyée : " + stuck.getExecutionId()
                            + " → FAILED (age: " + durationSecs + "s)");
                }
            }

            if (modified) {
                projectRepository.save(project);
            }
        });

        if (cleaned[0] > 0) {
            System.out.println("[Cleanup] " + cleaned[0] + " exécution(s) RUNNING bloquée(s) nettoyée(s) au démarrage.");
        } else {
            System.out.println("[Cleanup] Aucune exécution bloquée détectée.");
        }
    }
}
