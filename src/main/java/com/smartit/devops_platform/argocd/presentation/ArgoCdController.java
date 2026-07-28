package com.smartit.devops_platform.argocd.presentation;

import com.smartit.devops_platform.argocd.application.ArgoCdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deployments/argocd")
@RequiredArgsConstructor
public class ArgoCdController {

    private final ArgoCdService argoCdService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDeployments() {
        return ResponseEntity.ok(argoCdService.getDeployments());
    }
}
