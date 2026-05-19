package com.smartit.devops_platform.observability.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MetricSeries {
    private String name;
    private List<MetricPoint> points;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MetricPoint {
        private long timestamp;
        private Double value;
    }
}
