package com.cs301g2t1.account.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.ContainerCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;


@Configuration
public class SqsConfig {

    @Value("${aws.sqs.region}")
    private String region;

    @Bean
    public SqsClient sqsClient() {
        try {
            // Create a specific container credentials provider for debugging
            ContainerCredentialsProvider containerProvider = ContainerCredentialsProvider.builder().build();
            
            // Log whether credentials can be loaded
            try {
                AwsCredentials credentials = containerProvider.resolveCredentials();
                System.out.println("Successfully loaded container credentials");
            } catch (Exception e) {
                System.out.println("Failed to load container credentials: " + e.getMessage());
            }
            
            // Create with default chain for production use
            return SqsClient.builder()
                    .region(Region.of(region))
                    .build();
        } catch (Exception e) {
            System.out.println("Error creating SQS client: " + e.getMessage());
            throw e;
        }
    }
}
