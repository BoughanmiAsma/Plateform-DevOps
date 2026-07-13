package com.smartit.devops_platform.finops.presentation;

import com.smartit.devops_platform.finops.application.FinOpsService;
import com.smartit.devops_platform.finops.domain.model.CostRecommendation;
import com.smartit.devops_platform.finops.domain.model.CostSummary;
import com.smartit.devops_platform.finops.domain.model.ProjectCost;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finops")
public class FinOpsController {

    private final FinOpsService finOpsService;

    public FinOpsController(FinOpsService finOpsService) {
        this.finOpsService = finOpsService;
    }

    @GetMapping("/summary")
    public CostSummary getSummary() {
        return finOpsService.getCostSummary();
    }

    @GetMapping("/projects/{projectId}")
    public ProjectCost getProjectCost(@PathVariable String projectId) {
        return finOpsService.getProjectCost(projectId);
    }

    @GetMapping("/recommendations")
    public List<CostRecommendation> getRecommendations() {
        return finOpsService.getCostSummary().getProjectCosts().stream()
                .flatMap(p -> p.getRecommendations().stream())
                .collect(Collectors.toList());
    }
}
