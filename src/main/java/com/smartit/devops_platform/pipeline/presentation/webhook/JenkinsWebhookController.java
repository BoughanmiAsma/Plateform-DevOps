package com.smartit.devops_platform.pipeline.presentation.webhook;

import com.smartit.devops_platform.pipeline.application.event.PipelineStatusEvent;
import com.smartit.devops_platform.pipeline.infrastructure.messaging.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class JenkinsWebhookController {

    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/jenkins")
    public ResponseEntity<Void> handleJenkinsNotification(@RequestBody Map<String, Object> payload) {
        // Extraction des données envoyées par Jenkins
        String executionId = (String) payload.get("id");
        String status = (String) payload.get("result");
        String projectId = (String) payload.get("projectId"); // Jenkins doit l'envoyer

        PipelineStatusEvent event = new PipelineStatusEvent(
                projectId,
                null, // pipelineId
                executionId,
                status,
                LocalDateTime.now());

        // Envoi à RabbitMQ (Production du message)
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                event);

        return ResponseEntity.ok().build();
    }
}
