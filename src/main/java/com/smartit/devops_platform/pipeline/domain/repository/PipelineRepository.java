package com.smartit.devops_platform.pipeline.domain.repository;

import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import java.util.Optional;

public interface PipelineRepository {
    Optional<Pipeline> findByExternalId(String externalId);
}
