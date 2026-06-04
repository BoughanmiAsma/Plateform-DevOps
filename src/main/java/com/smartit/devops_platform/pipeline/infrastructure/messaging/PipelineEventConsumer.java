package com.smartit.devops_platform.pipeline.infrastructure.messaging;

import com.smartit.devops_platform.pipeline.application.event.PipelineStatusEvent;
import com.smartit.devops_platform.pipeline.domain.enums.ExecutionStatus;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import com.smartit.devops_platform.project.domain.model.Project;
import com.smartit.devops_platform.project.domain.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PipelineEventConsumer {

    private final ProjectRepository projectRepository;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    @Transactional
    public void handlePipelineStatusUpdate(PipelineStatusEvent event) {
        System.out.println("Message RabbitMQ reçu pour le build : " + event.getExecutionId()
                + " | statut: " + event.getStatus()
                + " | projet: " + event.getProjectId());

        if (event.getProjectId() == null) return;

        Project project = projectRepository.findById(event.getProjectId())
                .orElse(null);

        if (project == null) {
            System.out.println("Projet introuvable avec l'ID : " + event.getProjectId());
            return;
        }

        ExecutionStatus newStatus = mapStatus(event.getStatus());

        // Stratégie de mise à jour :
        // L'ID envoyé par Jenkins (numéro de build ex: "69") ≠ UUID stocké lors du déclenchement.
        // On cherche donc la dernière exécution RUNNING dans chaque pipeline et on la remplace
        // par le nouveau statut reçu du webhook.
        project.getPipelines().forEach(pipeline -> {
            // IMPORTANT: collect RUNNING executions to a SEPARATE list FIRST
            // to avoid ConcurrentModificationException when we modify the list during iteration
            List<ExecutionPipeline> runningExecs = pipeline.getExecutions().stream()
                    .filter(e -> e.getStatus() == ExecutionStatus.RUNNING)
                    .collect(java.util.stream.Collectors.toList());

            if (runningExecs.isEmpty()) return;

            for (ExecutionPipeline runningExec : runningExecs) {
                LocalDateTime end = event.getFinishedAt() != null ? event.getFinishedAt() : LocalDateTime.now();
                int durationSecs = (int) java.time.Duration.between(runningExec.getStartedAt(), end).getSeconds();

                ExecutionPipeline updated = new ExecutionPipeline(
                        runningExec.getExecutionId(),
                        newStatus,
                        runningExec.getStartedAt(),
                        end,
                        durationSecs
                );
                pipeline.addOrUpdateExecution(updated);
                System.out.println("Pipeline '" + pipeline.getExternalId()
                        + "' : exécution " + runningExec.getExecutionId()
                        + " mise à jour → " + newStatus + " (Durée: " + durationSecs + "s)");
            }
        });

        projectRepository.save(project);
        System.out.println("Projet '" + project.getName() + "' sauvegardé avec statut : " + event.getStatus());
    }

    private ExecutionStatus mapStatus(String status) {
        if (status == null) return ExecutionStatus.RUNNING;
        return switch (status.toUpperCase()) {
            case "SUCCESS" -> ExecutionStatus.SUCCESS;
            case "FAILURE", "FAILED" -> ExecutionStatus.FAILED;
            case "ABORTED" -> ExecutionStatus.CANCELLED;
            default -> ExecutionStatus.RUNNING;
        };
    }
}
