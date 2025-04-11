package com.cs301g2t1.client.service;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
public class EmailService {

    private final SesClient sesClient;

    public EmailService() {
        this.sesClient = SesClient.builder().build();
    }

    public void sendImageUploadLink(String emailAddress, String uploadLink) {
        String subject = "Upload Your Image";
        String body = "Click this link to upload your image: " + uploadLink;

        SendEmailRequest emailRequest = SendEmailRequest.builder()
            .destination(Destination.builder()
                .toAddresses(emailAddress)
                .build())
            .message(Message.builder()
                .subject(Content.builder()
                    .data(subject)
                    .build())
                .body(Body.builder()
                    .text(Content.builder()
                        .data(body)
                        .build())
                    .build())
                .build())
            .source("your-verified-email@example.com") // Replace with a verified email in SES
            .build();

        try {
            SendEmailResponse response = sesClient.sendEmail(emailRequest);
            System.out.println("Email sent successfully! Message ID: " + response.messageId());
        } catch (SesException e) {
            System.err.println("Failed to send email: " + e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
