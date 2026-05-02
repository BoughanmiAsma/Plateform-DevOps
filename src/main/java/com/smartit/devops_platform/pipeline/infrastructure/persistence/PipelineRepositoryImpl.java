package com.smartit.devops_platform.pipeline.infrastructure.persistence;

import com.smartit.devops_platform.pipeline.domain.model.Pipeline;
import com.smartit.devops_platform.pipeline.domain.repository.PipelineRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PipelineRepositoryImpl implements PipelineRepository {
    @Override
    public Optional<Pipeline> findByExternalId(String externalId) {
        return Optional.empty();
    }
}
