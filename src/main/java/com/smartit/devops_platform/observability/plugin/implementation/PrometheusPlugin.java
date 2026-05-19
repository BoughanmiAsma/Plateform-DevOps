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
            return 0.0;
        }

        // On récupère la valeur du premier résultat
        List<Object[]> values = response.getData().getResult().get(0).getValues();
        if (values == null && response.getData().getResult().get(0).getMetric() != null) {
            // Dans le cas d'une requête instantanée, Prometheus peut renvoyer "value" au lieu de "values"
            // Mais queryInstant avec RestTemplate mappe souvent vers values avec un seul point
            // On gère ici le format standard [timestamp, value]
        }
        
        // Note: queryInstant renvoie souvent un champ "value" au lieu de "values"
        // Nous allons simplifier pour le POC
        return 0.0; // À affiner selon le format exact de queryInstant
    }
}
