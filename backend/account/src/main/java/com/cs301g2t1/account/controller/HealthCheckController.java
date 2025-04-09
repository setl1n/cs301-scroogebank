package com.cs301g2t1.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller class for handling health check requests.
 * Provides a REST endpoint for checking the health of the application and its dependencies.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/v1/health")
public class HealthCheckController {
    /**
     * Simple health check endpoint to verify the application is running. (For ALB health check)
     * 
     * @return ResponseEntity with "OK" message and HttpStatus.OK.
     */
    @GetMapping("/simple")
    public ResponseEntity<String> simpleHealthCheck() {
        return new ResponseEntity<>("OK", HttpStatus.OK);
    }
}