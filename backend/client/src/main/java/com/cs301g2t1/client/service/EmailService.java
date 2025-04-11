package com.cs301g2t1.client.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    // Hardcoded email service URL for testing
    private static final String EMAIL_SERVICE_URL = "http://localhost:8081/api/v1/email";

    public void sendImageUploadLink(String emailAddress, String uploadLink) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        var emailRequest = new EmailRequest(
            emailAddress,
            "Upload Your Image",
            "Click this link to upload your image: " + uploadLink
        );

        HttpEntity<EmailRequest> request = new HttpEntity<>(emailRequest, headers);
        restTemplate.postForObject(EMAIL_SERVICE_URL, request, String.class);
    }

    private record EmailRequest(String to, String subject, String body) {}
}
