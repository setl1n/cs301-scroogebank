package com.cs301g2t1.user.security;

import java.util.Collection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;


/**
 * Class to configure AWS Cognito as an OAuth 2.0 authorizer with Spring Security.
 * In this configuration, we specify our OAuth Client.
 * We also declare that all requests must come from an authenticated user, except for the base URL (/)
 * where the sign-in button is displayed. Finally, we configure our logout handler.
 * 
 *  NOTE: For front end, redirect to https://<domain>/oauth2/authorization/cognito, which is the backend login endpoint
 *  ALSO NOTE: If you change the ENUM for User role (admin or agent), need to change the jwtAuthenticationConverter() method
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // I need this method to convert the user group on Cognito to the ENUM in UserRole.java
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("cognito:groups");
        // Spring Boot somehow requires this prefix to map to the ENUM role
        converter.setAuthorityPrefix("ROLE_");
        
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = converter.convert(jwt);
            
            // Log the authorities for debugging
            System.out.println("Authorities from token: " + authorities);
            
            return authorities;
        });
        return jwtConverter;
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Instantiate your custom Cognito logout handler
        CognitoLogoutHandler cognitoLogoutHandler = new CognitoLogoutHandler();

        http.csrf(Customizer.withDefaults())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(Customizer.withDefaults())
            // Add resource server configuration for JWT validation
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> {
                    jwt.jwkSetUri("https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_tOPTKzj85/.well-known/jwks.json");
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
                })
            )
            .logout(logout -> logout.logoutSuccessHandler(cognitoLogoutHandler));
        
        return http.build();
    }
}