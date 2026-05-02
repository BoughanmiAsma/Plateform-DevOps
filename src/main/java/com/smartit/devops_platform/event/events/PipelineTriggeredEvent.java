package com.smartit.devops_platform.event.events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PipelineTriggeredEvent {
    private final String executionId;
    private final String pipelineId;
}
