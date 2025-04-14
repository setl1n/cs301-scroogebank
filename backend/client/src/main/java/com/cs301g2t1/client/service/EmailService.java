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
        String subject = "Request for Upload of Personal Identification Documents";
        String body = "Dear Customer,\n\n" +
            "We hope this message finds you well.\n\n" +
            "In our effort to maintain a secure and reliable banking environment, " +
            "we kindly request that you provide your personal identification documents for verification purposes. " +
            "This step is essential to ensure the continued safety of your account with Scrooge Global Bank.\n\n" +
            "Please click the link below to securely upload your documents. " +
            "Note that this link is valid for only 24 hours:\n\n" +
            "Verification documents portal: " + uploadLink + "\n\n" +
            "If you require any assistance or have further questions, please contact our support " +
            "team at support@itsag2t1.com.\n\n" +
            "Thank you for your prompt attention to this matter. We appreciate your cooperation and " +
            "your trust in Scrooge Global Bank.\n\n" +
            "Sincerely,\n" +
            "Scrooge Global Bank\n\n" +
            "--\n" +
            "Please note: This is an automatically generated message. If you did not " +
            "initiate this request, please contact our support team immediately.";


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
