package com.cs301g2t1.transaction.utils;

import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;

public class SecretsManagerUtil {
    
    /**
     * Retrieves a secret value from AWS Secrets Manager.
     * 
     * @param secretName The name or ARN of the secret to retrieve
     * @return The secret value as a string
     */
    public static String getSecretValue(String secretName) {
        AWSSecretsManager client = AWSSecretsManagerClientBuilder.standard().build();
        
        GetSecretValueRequest getSecretValueRequest = new GetSecretValueRequest()
            .withSecretId(secretName);
        
        GetSecretValueResult getSecretValueResult = client.getSecretValue(getSecretValueRequest);
        
        return getSecretValueResult.getSecretString();
    }
}
