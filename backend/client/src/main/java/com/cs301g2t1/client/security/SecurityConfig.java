package com.cs301g2t1.client.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // (1) Permit all requests to the H2 console and /clients endpoints
        http.authorizeHttpRequests(auth -> {
            auth.requestMatchers("/h2-console/**").permitAll();
            // auth.requestMatchers("/clients/**").permitAll();
            // auth.requestMatchers("/clients").permitAll();
            auth.requestMatchers("/health").permitAll();
            auth.anyRequest().permitAll();
        });

        // (2) Disable CSRF protection for the H2 console paths (not recommended for production)
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**").disable());

        // (3) Allow H2 console to be displayed in a frame
        http.headers(headers -> headers.frameOptions().sameOrigin());

        // (4) Enable CORS
        http.cors(Customizer.withDefaults());

        // (5) Choose HTTP Basic or Form login (or both)
        http.httpBasic(Customizer.withDefaults());
        http.formLogin(Customizer.withDefaults());

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("https://main-frontend.itsag2t1.com", "http://localhost:5173"));  // Allow all origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}