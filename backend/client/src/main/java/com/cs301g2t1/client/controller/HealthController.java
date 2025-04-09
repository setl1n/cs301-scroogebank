package com.cs301g2t1.client.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/health")
public class HealthController {
    @GetMapping
    @ResponseStatus(code = HttpStatus.OK)
    public String checkHealth() {
        return "{ \"status\": \"ok\" }";
    }
    
}