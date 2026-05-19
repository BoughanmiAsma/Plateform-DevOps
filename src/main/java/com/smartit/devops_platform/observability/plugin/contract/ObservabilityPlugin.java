package com.smartit.devops_platform.observability.plugin.contract;

import com.smartit.devops_platform.observability.domain.model.MetricSeries;

import java.time.Instant;

public interface ObservabilityPlugin {
    
    MetricSeries getMetricHistory(String query, Instant start, Instant end, String step);
    
    Double getInstantValue(String query);
}
