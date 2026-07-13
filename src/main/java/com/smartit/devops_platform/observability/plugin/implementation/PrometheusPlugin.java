package com.smartit.devops_platform.observability.plugin.implementation;

import com.smartit.devops_platform.observability.domain.model.MetricSeries;
import com.smartit.devops_platform.observability.infrastructure.prometheus.connector.PrometheusConnector;
import com.smartit.devops_platform.observability.infrastructure.prometheus.dto.PrometheusResponse;
import com.smartit.devops_platform.observability.plugin.contract.ObservabilityPlugin;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrometheusPlugin implements ObservabilityPlugin {

    private final PrometheusConnector connector;

    @Override
    public MetricSeries getMetricHistory(String query, Instant start, Instant end, String step) {
        PrometheusResponse response = connector.queryRange(
                query, 
                String.valueOf(start.getEpochSecond()), 
                String.valueOf(end.getEpochSecond()), 
                step
        );

        if (response == null || response.getData() == null || response.getData().getResult().isEmpty()) {
            return new MetricSeries(query, new ArrayList<>());
        }

        // On prend la première série trouvée
        PrometheusResponse.PrometheusResult result = response.getData().getResult().get(0);
        List<MetricSeries.MetricPoint> points = new ArrayList<>();

        for (Object[] val : result.getValues()) {
            long ts = ((Number) val[0]).longValue();
            Double value = Double.parseDouble((String) val[1]);
            points.add(new MetricSeries.MetricPoint(ts, value));
        }

        return new MetricSeries(query, points);
    }

    @Override
    public Double getInstantValue(String query) {
        PrometheusResponse response = connector.queryInstant(query);
        if (response == null || response.getData() == null || response.getData().getResult().isEmpty()) {
            return null; // Return null so fallback can be used
        }

        PrometheusResponse.PrometheusResult result = response.getData().getResult().get(0);
        
        // For instant queries, Prometheus returns "value" instead of "values"
        if (result.getValue() != null) {
            Object[] val = result.getValue();
            return Double.parseDouble((String) val[1]);
        }
        
        if (result.getValues() != null && !result.getValues().isEmpty()) {
            Object[] val = result.getValues().get(0);
            return Double.parseDouble((String) val[1]);
        }

        return null;
    }
}
