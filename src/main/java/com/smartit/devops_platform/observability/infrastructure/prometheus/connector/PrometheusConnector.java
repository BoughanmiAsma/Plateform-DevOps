package com.smartit.devops_platform.observability.infrastructure.prometheus.connector;

import com.smartit.devops_platform.observability.infrastructure.prometheus.dto.PrometheusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class PrometheusConnector {

    private final RestTemplate restTemplate;

    @Value("${prometheus.base-url:http://localhost:9091}")
    private String baseUrl;

    public PrometheusResponse queryRange(String query, String start, String end, String step) {
        java.net.URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/api/v1/query_range")
                .queryParam("query", query)
                .queryParam("start", start)
                .queryParam("end", end)
                .queryParam("step", step)
                .build()
                .toUri();

        return restTemplate.getForObject(uri, PrometheusResponse.class);
    }

    public PrometheusResponse queryInstant(String query) {
        java.net.URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/api/v1/query")
                .queryParam("query", query)
                .build()
                .toUri();

        return restTemplate.getForObject(uri, PrometheusResponse.class);
    }
}
