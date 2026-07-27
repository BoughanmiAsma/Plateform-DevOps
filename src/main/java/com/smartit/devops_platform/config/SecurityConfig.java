package com.smartit.devops_platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Webhooks appelés par Alertmanager et Jenkins (pas de JWT possible)
                .requestMatchers("/api/alerts/**").permitAll()
                .requestMatchers("/api/webhooks/**").permitAll()
                // Notifications consultées par le frontend React
                .requestMatchers("/api/notifications/**").permitAll()
                // Docker API — accessible via JWT
                .requestMatchers("/api/docker/**").permitAll()
                // Tout le reste de l'API nécessite une authentification
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
