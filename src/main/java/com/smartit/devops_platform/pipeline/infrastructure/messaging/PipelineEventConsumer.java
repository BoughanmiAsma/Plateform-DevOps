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

@Service
@RequiredArgsConstructor
public class PipelineEventConsumer {

    private final ProjectRepository projectRepository;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    @Transactional
    public void handlePipelineStatusUpdate(PipelineStatusEvent event) {
        System.out.println("Message RabbitMQ reçu pour le build : " + event.getExecutionId());

        if (event.getProjectId() == null) return;

        Project project = projectRepository.findById(event.getProjectId())
                .orElse(null);

        if (project != null) {
            // Dans ce POC, on cherche l'exécution dans tous les pipelines du projet
            // pour mettre à jour son statut.
            ExecutionPipeline update = new ExecutionPipeline(
                    event.getExecutionId(),
                    mapStatus(event.getStatus()),
                    null, // On pourrait passer les dates si besoin
                    event.getFinishedAt(),
                    0
            );

            // On utilise la méthode qu'on a créée précédemment
            // Note: JenkinsConnector/Webhook devrait idéalement envoyer aussi le pipelineId
            // Pour l'instant on fait au plus simple pour le flux
            project.getPipelines().forEach(p -> {
                try {
                    project.addExecutionToPipeline(p.getExternalId(), update);
                } catch (Exception e) {
                    // Ignorer
                }
            });

            projectRepository.save(project);
            System.out.println("Projet mis à jour avec le statut : " + event.getStatus());
        }
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
