package com.smartit.devops_platform.observability.presentation;

import com.smartit.devops_platform.observability.domain.model.MetricSeries;
import com.smartit.devops_platform.observability.plugin.contract.ObservabilityPlugin;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/observability")
@RequiredArgsConstructor
public class ObservabilityController {

    private static final Logger log = LoggerFactory.getLogger(ObservabilityController.class);

    private final ObservabilityPlugin observabilityPlugin;

    @GetMapping("/metrics")
    public MetricSeries getMetrics(
            @RequestParam String query,
            @RequestParam(defaultValue = "60") int minutes) {
        try {
            Instant end = Instant.now();
            Instant start = end.minus(minutes, ChronoUnit.MINUTES);
            return observabilityPlugin.getMetricHistory(query, start, end, "1m");
        } catch (Exception e) {
            // Prometheus peut ne pas être démarré — on retourne une série vide proprement
            log.warn("Prometheus inaccessible pour la requête '{}': {}", query, e.getMessage());
            return new MetricSeries(query, new ArrayList<>());
        }
    }
}
