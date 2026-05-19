package com.smartit.devops_platform.observability.presentation;

import com.smartit.devops_platform.observability.domain.model.MetricSeries;
import com.smartit.devops_platform.observability.plugin.contract.ObservabilityPlugin;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/observability")
@RequiredArgsConstructor
public class ObservabilityController {

    private final ObservabilityPlugin observabilityPlugin;

    @GetMapping("/metrics")
    public MetricSeries getMetrics(
            @RequestParam String query,
            @RequestParam(defaultValue = "60") int minutes) {
        
        Instant end = Instant.now();
        Instant start = end.minus(minutes, ChronoUnit.MINUTES);
        
        return observabilityPlugin.getMetricHistory(query, start, end, "1m");
    }
}
