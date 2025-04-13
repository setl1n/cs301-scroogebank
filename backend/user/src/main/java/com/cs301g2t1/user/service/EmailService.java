package com.cs301g2t1.user.service;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
public class EmailService {

    private final SesClient sesClient;

    public EmailService() {
        this.sesClient = SesClient.builder().build();
    }

    public void sendLoginCredentials(String emailAddress, String password) {
        System.out.println("Sending email to: " + emailAddress);
        System.out.println("Password: " + password); // For debugging purposes only, remove in production
        String subject = "Scrooge Global Bank Login Credentials";
        String body = "Your Scrooge Global Bank's login credentials for are:\n" +
                      "Email: " + emailAddress + "\n" +
                      "Password: " + password + "\nThese are temporary credentials that require a password change on first login.\n" +
                      "Please change your password after logging in.\n";

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
            .source("no-reply@itsag2t1.com") // Replace with a verified email in SES
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
