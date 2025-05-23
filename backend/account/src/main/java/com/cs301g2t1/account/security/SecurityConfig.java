package com.cs301g2t1.account.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // (1) Permit all requests to the H2 console and /accounts endpoints
        http.authorizeHttpRequests(auth -> {
            auth.requestMatchers("/h2-console/**").permitAll();
            // auth.requestMatchers("/accounts").permitAll(); 
            // auth.requestMatchers("/accounts/**").permitAll();
            auth.requestMatchers("/health").permitAll();
            auth.anyRequest()
            .permitAll(); 
            // .authenticated();
        });

        // (2) Disable CSRF protection for the H2 console paths (not recommended for production)
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**").disable());

        // (3) Allow H2 console to be displayed in a frame
        http.headers(headers -> headers.frameOptions().sameOrigin());

        // (4) Choose HTTP Basic or Form login (or both)
        http.httpBasic(Customizer.withDefaults());
        http.formLogin(Customizer.withDefaults());

        return http.build();
    }
}