package com.smartit.devops_platform.pipeline.presentation;

import com.smartit.devops_platform.pipeline.application.PipelineService;
import com.smartit.devops_platform.pipeline.application.dto.RunPipelineRequest;
import com.smartit.devops_platform.pipeline.domain.model.ExecutionPipeline;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pipelines")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @PostMapping("/run")
    public ExecutionPipeline run(@RequestBody RunPipelineRequest request) {
        return pipelineService.triggerExecution(
                request.getProjectId(),
                request.getPipelineExternalId()
        );
    }
}
