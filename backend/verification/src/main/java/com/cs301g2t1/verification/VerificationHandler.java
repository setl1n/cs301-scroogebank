package com.cs301g2t1.verification;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
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
        } else if (path.equals("/api/v1/verification/upload")) {
            return handleUpload(request, response, context);
        } else if (path.equals("/api/v1/verification/test")) {
            return callExternalService(request, response, context);
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
            context.getLogger().log("Processing upload request");
            
            // Check if the request is multipart/form-data
            boolean isMultipart = false;
            String contentType = "";
            
            // Extract content type from headers
            if (request.containsKey("headers") && ((Map)request.get("headers")).containsKey("content-type")) {
                contentType = (String) ((Map)request.get("headers")).get("content-type");
                isMultipart = contentType != null && contentType.toLowerCase().startsWith("multipart/form-data");
            }
            
            context.getLogger().log("Content-Type: " + contentType);
            context.getLogger().log("Is Multipart: " + isMultipart);
            
            String fileContent = null;
            String token = null;
            String email = null;
            String filename = null;
            boolean isFileBase64Encoded = false;
            
            if (isMultipart) {
                // For multipart/form-data request
                Map<String, Object> multipartData = parseMultipartFormData(request, context);
                
                if (multipartData == null) {
                    return createErrorResponse(response, 400, "Failed to parse multipart/form-data");
                }
                
                // Extract file data
                if (multipartData.containsKey("file")) {
                    Map<String, Object> fileData = (Map<String, Object>) multipartData.get("file");
                    fileContent = (String) fileData.get("content");
                    filename = (String) fileData.get("filename");
                    isFileBase64Encoded = (boolean) fileData.get("isBase64Encoded");
                    context.getLogger().log("File received: " + filename);
                } else {
                    return createErrorResponse(response, 400, "Missing 'file' field in multipart/form-data");
                }
                
                // Extract token and email
                token = (String) multipartData.getOrDefault("token", "");
                email = (String) multipartData.getOrDefault("email", "");
                
                context.getLogger().log("Token: " + token);
                context.getLogger().log("Email: " + email);
            } else {
                // Fall back to regular body parsing if not multipart
                String body = request.containsKey("body") ? (String) request.get("body") : null;
                boolean isBase64Encoded = request.containsKey("isBase64Encoded") && (boolean) request.get("isBase64Encoded");
                
                if (body == null || body.isEmpty()) {
                    return createErrorResponse(response, 400, "Request body is empty");
                }
                
                fileContent = body;
                isFileBase64Encoded = isBase64Encoded;
            }
            
            // Validate token and email if provided
            if ((token == null || token.isEmpty()) && (email == null || email.isEmpty())) {
                context.getLogger().log("Warning: Token and email not provided");
            } else if (token != null && !token.isEmpty() && email != null && !email.isEmpty()) {
                context.getLogger().log("Validating token and email...");
            }
            
            // Generate a unique key for the S3 object
            String fileExtension = "";
            if (filename != null && filename.contains(".")) {
                fileExtension = filename.substring(filename.lastIndexOf("."));
            }
            
            // Use email as filename if available, otherwise use UUID
            String baseFilename;
            if (email != null && !email.isEmpty()) {
                // Sanitize email for use as a filename
                baseFilename = sanitizeFilename(email);
                context.getLogger().log("Using email as base filename: " + baseFilename);
            } else {
                baseFilename = UUID.randomUUID().toString();
                context.getLogger().log("No email provided, using UUID as filename");
            }
            
            String key = "uploads/" + baseFilename + fileExtension;
            
            // Upload the content to S3 - pass the correct base64 encoding flag
            String fileUrl = uploadToS3(fileContent, isFileBase64Encoded, key, context, filename);
            
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

    private Map<String, Object> parseMultipartFormData(Map<String, Object> request, Context context) {
        try {
            String body = request.containsKey("body") ? (String) request.get("body") : null;
            boolean isBase64Encoded = request.containsKey("isBase64Encoded") && (boolean) request.get("isBase64Encoded");
            
            if (body == null) {
                return null;
            }
            
            // If body is base64 encoded, decode it
            byte[] bodyBytes;
            if (isBase64Encoded) {
                bodyBytes = Base64.getDecoder().decode(body);
                body = new String(bodyBytes);
            } else {
                bodyBytes = body.getBytes();
            }
            
            Map<String, Object> result = new HashMap<>();
            
            // Extract the boundary from Content-Type header
            String contentType = (String) ((Map)request.get("headers")).get("content-type");
            String boundary = extractBoundary(contentType);
            
            if (boundary == null) {
                context.getLogger().log("No boundary found in Content-Type header");
                return null;
            }
            
            // Split the body by boundary
            String[] parts = body.split("--" + boundary);
            
            // Process each part
            for (String part : parts) {
                if (part.trim().isEmpty() || part.equals("--")) {
                    continue;
                }
                
                // Split headers and content
                int headerEnd = part.indexOf("\r\n\r\n");
                if (headerEnd == -1) {
                    continue;
                }
                
                String headers = part.substring(0, headerEnd);
                String content = part.substring(headerEnd + 4); // Skip \r\n\r\n
                
                // Extract field name and filename from Content-Disposition header
                String contentDisposition = extractHeader(headers, "Content-Disposition");
                if (contentDisposition == null) {
                    continue;
                }
                
                String fieldName = extractFieldName(contentDisposition);
                String filename = extractFilename(contentDisposition);
                
                if (fieldName == null) {
                    continue;
                }
                
                if (filename != null) {
                    // This is a file - handle it as binary data
                    Map<String, Object> fileData = new HashMap<>();
                    fileData.put("filename", filename);
                    
                    // For binary files like images, don't manipulate as a string
                    // Instead convert directly to Base64 for safe handling
                    // Find the start and end positions in the original byte array
                    int startPos = body.indexOf(content);
                    if (content.endsWith("\r\n")) {
                        content = content.substring(0, content.length() - 2);
                    }
                    
                    // For binary files (images, pdfs, etc.), encode to Base64
                    if (isBinaryFile(filename)) {
                        String headersPart = part.substring(0, headerEnd + 4);
                        int contentStart = body.indexOf(headersPart) + headersPart.length();
                        int contentLength = content.length();
                        
                        // Extract the raw binary content from the original byte array
                        byte[] fileBytes;
                        if (contentLength > 0 && contentStart + contentLength <= bodyBytes.length) {
                            fileBytes = new byte[contentLength];
                            System.arraycopy(bodyBytes, contentStart, fileBytes, 0, contentLength);
                            
                            // Convert to Base64 for safe handling
                            fileData.put("content", Base64.getEncoder().encodeToString(fileBytes));
                            fileData.put("isBase64Encoded", true);
                        } else {
                            // Fallback if byte extraction fails
                            fileData.put("content", content);
                            fileData.put("isBase64Encoded", false);
                        }
                    } else {
                        // For text files, just use the content string
                        fileData.put("content", content);
                        fileData.put("isBase64Encoded", false);
                    }
                    
                    result.put(fieldName, fileData);
                } else {
                    // This is a regular field
                    // Remove trailing \r\n if present
                    if (content.endsWith("\r\n")) {
                        content = content.substring(0, content.length() - 2);
                    }
                    result.put(fieldName, content);
                }
            }
            
            return result;
        } catch (Exception e) {
            context.getLogger().log("Error parsing multipart form data: " + e.getMessage());
            return null;
        }
    }
    
    private boolean isBinaryFile(String filename) {
        if (filename == null) return false;
        
        filename = filename.toLowerCase();
        return filename.endsWith(".jpg") || 
               filename.endsWith(".jpeg") || 
               filename.endsWith(".png") || 
               filename.endsWith(".gif") || 
               filename.endsWith(".pdf") || 
               filename.endsWith(".doc") || 
               filename.endsWith(".docx") || 
               filename.endsWith(".xls") || 
               filename.endsWith(".xlsx") || 
               filename.endsWith(".zip") || 
               filename.endsWith(".rar");
    }
    
    private String extractBoundary(String contentType) {
        if (contentType == null) {
            return null;
        }
        
        int boundaryIndex = contentType.indexOf("boundary=");
        if (boundaryIndex == -1) {
            return null;
        }
        
        String boundary = contentType.substring(boundaryIndex + 9); // "boundary=".length() = 9
        
        // If boundary is wrapped in quotes, remove them
        if (boundary.startsWith("\"") && boundary.endsWith("\"")) {
            boundary = boundary.substring(1, boundary.length() - 1);
        }
        
        return boundary;
    }
    
    private String extractHeader(String headers, String headerName) {
        String[] headerLines = headers.split("\r\n");
        
        for (String line : headerLines) {
            if (line.startsWith(headerName + ":")) {
                return line.substring(headerName.length() + 1).trim();
            }
        }
        
        return null;
    }
    
    private String extractFieldName(String contentDisposition) {
        int nameIndex = contentDisposition.indexOf("name=\"");
        if (nameIndex == -1) {
            return null;
        }
        
        int nameStart = nameIndex + 6; // "name=\"".length() = 6
        int nameEnd = contentDisposition.indexOf("\"", nameStart);
        
        if (nameEnd == -1) {
            return null;
        }
        
        return contentDisposition.substring(nameStart, nameEnd);
    }
    
    private String extractFilename(String contentDisposition) {
        int filenameIndex = contentDisposition.indexOf("filename=\"");
        if (filenameIndex == -1) {
            return null;
        }
        
        int filenameStart = filenameIndex + 10; // "filename=\"".length() = 10
        int filenameEnd = contentDisposition.indexOf("\"", filenameStart);
        
        if (filenameEnd == -1) {
            return null;
        }
        
        return contentDisposition.substring(filenameStart, filenameEnd);
    }

    private String uploadToS3(String content, boolean isBase64Encoded, String key, Context context, String filename) {
        try {
            byte[] contentBytes;
            
            if (isBase64Encoded) {
                try {
                    contentBytes = Base64.getDecoder().decode(content);
                    context.getLogger().log("Successfully decoded base64 content");
                } catch (IllegalArgumentException e) {
                    context.getLogger().log("Error decoding base64 content: " + e.getMessage());
                    context.getLogger().log("Treating content as not base64 encoded");
                    contentBytes = content.getBytes();
                }
            } else {
                contentBytes = content.getBytes();
            }
            
            // Log the first few bytes for debugging
            if (contentBytes.length > 0) {
                StringBuilder hexString = new StringBuilder();
                for (int i = 0; i < Math.min(20, contentBytes.length); i++) {
                    hexString.append(String.format("%02X ", contentBytes[i]));
                }
                context.getLogger().log("First bytes of file: " + hexString.toString());
            }
            
            InputStream inputStream = new ByteArrayInputStream(contentBytes);
            
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentBytes.length);
            
            // Set content type based on filename if available
            if (filename != null && !filename.isEmpty()) {
                String contentType = determineContentType(filename);
                if (contentType != null) {
                    metadata.setContentType(contentType);
                }
            }
            
            s3Client.putObject(bucketName, key, inputStream, metadata);
            
            // Return the S3 URL of the uploaded file
            return s3Client.getUrl(bucketName, key).toString();
        } catch (Exception e) {
            context.getLogger().log("Error uploading to S3: " + e.getMessage());
            throw new RuntimeException("Failed to upload to S3", e);
        }
    }
    
    private String determineContentType(String filename) {
        filename = filename.toLowerCase();
        if (filename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".txt")) {
            return "text/plain";
        } else if (filename.endsWith(".html") || filename.endsWith(".htm")) {
            return "text/html";
        } else if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
            return "application/msword";
        } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
            return "application/vnd.ms-excel";
        }
        return "application/octet-stream";
    }
    
    private Map<String, Object> createErrorResponse(Map<String, Object> response, int statusCode, String message) {
        response.put("statusCode", statusCode);
        response.put("body", "{\"error\":\"" + message + "\"}");
        return response;
    }

    private Map<String, Object> callExternalService(Map<String, Object> request, Map<String, Object> response, Context context) {
        try {
            // Extract the URL from request parameters
            String serviceUrl = "";
            if (request.containsKey("queryStringParameters") && 
                ((Map)request.get("queryStringParameters")) != null &&
                ((Map)request.get("queryStringParameters")).containsKey("url")) {
                serviceUrl = (String) ((Map)request.get("queryStringParameters")).get("url");
            } else {
                return createErrorResponse(response, 400, "Missing 'url' parameter");
            }
            
            context.getLogger().log("Making GET request to: " + serviceUrl);
            
            // Create and configure HttpClient
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();
                    
            // Build the request
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(serviceUrl))
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .build();
                    
            // Send the request and get response
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            // Process the response
            int statusCode = httpResponse.statusCode();
            String body = httpResponse.body();
            
            if (statusCode >= 200 && statusCode < 300) {
                // Success response
                response.put("statusCode", 200);
                response.put("body", body);
            } else {
                // Error response
                return createErrorResponse(response, statusCode, "External service error: " + body);
            }
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error making GET request: " + e.getMessage());
            return createErrorResponse(response, 500, "Error making GET request: " + e.getMessage());
        }
    }

    private String sanitizeFilename(String email) {
        return email.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
    }
}
