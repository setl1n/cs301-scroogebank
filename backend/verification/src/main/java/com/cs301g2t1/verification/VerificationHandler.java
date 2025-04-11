package com.cs301g2t1.verification;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class VerificationHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();
    private final String bucketName = System.getenv("S3_BUCKET_NAME");

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> request, Context context) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        response.put("headers", headers);
        
        // Extract the path from the request
        String path = "";
        if (request.containsKey("path")) {
            path = (String) request.get("path");
        } else if (request.containsKey("requestContext") && ((Map)request.get("requestContext")).containsKey("path")) {
            path = (String) ((Map)request.get("requestContext")).get("path");
        }
        
        context.getLogger().log("Request path: " + path);
        
        // Route based on path
        if (path.equals("/api/v1/health")) {
            return handleHealthCheck(response);
        } else if (path.equals("/api/v1/health/upload")) {
            return handleUpload(request, response, context);
        } else {
            return createErrorResponse(response, 404, "Path not found: " + path);
        }
    }
    
    private Map<String, Object> handleHealthCheck(Map<String, Object> response) {
        response.put("statusCode", 200);
        response.put("body", "{\"status\":\"healthy\"}");
        return response;
    }
    
    private Map<String, Object> handleUpload(Map<String, Object> request, Map<String, Object> response, Context context) {
        if (bucketName == null || bucketName.isEmpty()) {
            context.getLogger().log("Error: S3_BUCKET_NAME environment variable is not set");
            return createErrorResponse(response, 500, "Server configuration error: S3 bucket not configured");
        }

        try {
            // Process the request
            String body = request.containsKey("body") ? (String) request.get("body") : null;
            boolean isBase64Encoded = request.containsKey("isBase64Encoded") && (boolean) request.get("isBase64Encoded");
            
            if (body == null || body.isEmpty()) {
                return createErrorResponse(response, 400, "Request body is empty");
            }
            
            // Generate a unique key for the S3 object
            String key = "uploads/" + UUID.randomUUID().toString();
            
            // Upload the content to S3
            String fileUrl = uploadToS3(body, isBase64Encoded, key, context);
            
            // Return success response
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "File uploaded successfully");
            responseBody.put("fileUrl", fileUrl);
            responseBody.put("key", key);
            
            response.put("statusCode", 200);
            response.put("body", "{\"message\":\"File uploaded successfully\",\"fileUrl\":\"" + fileUrl + "\",\"key\":\"" + key + "\"}");
            
            return response;
            
        } catch (Exception e) {
            context.getLogger().log("Error processing request: " + e.getMessage());
            return createErrorResponse(response, 500, "Error processing request: " + e.getMessage());
        }
    }

    private String uploadToS3(String content, boolean isBase64Encoded, String key, Context context) {
        try {
            byte[] contentBytes;
            if (isBase64Encoded) {
                contentBytes = Base64.getDecoder().decode(content);
            } else {
                contentBytes = content.getBytes();
            }
            
            InputStream inputStream = new ByteArrayInputStream(contentBytes);
            
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentBytes.length);
            
            s3Client.putObject(bucketName, key, inputStream, metadata);
            
            // Return the S3 URL of the uploaded file
            return s3Client.getUrl(bucketName, key).toString();
        } catch (Exception e) {
            context.getLogger().log("Error uploading to S3: " + e.getMessage());
            throw new RuntimeException("Failed to upload to S3", e);
        }
    }
    
    private Map<String, Object> createErrorResponse(Map<String, Object> response, int statusCode, String message) {
        response.put("statusCode", statusCode);
        response.put("body", "{\"error\":\"" + message + "\"}");
        return response;
    }
}
