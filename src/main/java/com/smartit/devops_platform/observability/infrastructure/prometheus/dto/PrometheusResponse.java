package com.smartit.devops_platform.observability.infrastructure.prometheus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrometheusResponse {
    private String status;
    private PrometheusData data;

    @Data
    public static class PrometheusData {
        private String resultType;
        private List<PrometheusResult> result;
    }

    @Data
    public static class PrometheusResult {
        private Map<String, String> metric;
        private List<Object[]> values; // [timestamp, value]
        private Object[] value; // [timestamp, value] for instant queries
    }
}
