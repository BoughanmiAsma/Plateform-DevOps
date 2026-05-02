package com.smartit.devops_platform.event.publisher;

import org.springframework.stereotype.Component;

@Component
public class DomainEventPublisher {
    public void publish(Object event) {
        // Publish event (e.g. using ApplicationEventPublisher or Kafka)
    }
}
