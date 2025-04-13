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
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class VerificationHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();
    private final String bucketName = System.getenv("S3_BUCKET_NAME");
    
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList("png", "jpg", "jpeg", "pdf"));
    
    // Magic number signatures
    private static final Map<String, byte[]> FILE_SIGNATURES = new HashMap<>();
    
    static {
        // PNG signature
        FILE_SIGNATURES.put("png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
        // JPEG signatures
        FILE_SIGNATURES.put("jpg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});
        // PDF signature
        FILE_SIGNATURES.put("pdf", new byte[]{0x25, 0x50, 0x44, 0x46});
    }

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
                Map<String, Object> multipartData = parseMultipartFormData(request, context);
                
                if (multipartData == null) {
                    return createErrorResponse(response, 400, "Failed to parse multipart/form-data");
                }
                
                if (multipartData.containsKey("file")) {
                    Map<String, Object> fileData = (Map<String, Object>) multipartData.get("file");
                    fileContent = (String) fileData.get("content");
                    filename = (String) fileData.get("filename");
                    isFileBase64Encoded = (boolean) fileData.get("isBase64Encoded");
                    context.getLogger().log("File received: " + filename);
                } else {
                    return createErrorResponse(response, 400, "Missing 'file' field in multipart/form-data");
                }
                
                token = (String) multipartData.getOrDefault("token", "");
                email = (String) multipartData.getOrDefault("email", "");
                
                context.getLogger().log("Token: " + token);
                context.getLogger().log("Email: " + email);
            } else {
                String body = request.containsKey("body") ? (String) request.get("body") : null;
                boolean isBase64Encoded = request.containsKey("isBase64Encoded") && (boolean) request.get("isBase64Encoded");
                
                if (body == null || body.isEmpty()) {
                    return createErrorResponse(response, 400, "Request body is empty");
                }
                
                fileContent = body;
                isFileBase64Encoded = isBase64Encoded;
            }
            
            // Validate file type BEFORE token validation
            if (filename != null && !filename.isEmpty()) {
                byte[] contentBytes;
                
                if (isFileBase64Encoded) {
                    try {
                        contentBytes = Base64.getDecoder().decode(fileContent);
                    } catch (IllegalArgumentException e) {
                        context.getLogger().log("Error decoding base64 content: " + e.getMessage());
                        contentBytes = fileContent.getBytes();
                    }
                } else {
                    contentBytes = fileContent.getBytes();
                }
                
                String determinedContentType = determineContentType(filename);
                if (!isValidFileType(filename, determinedContentType, contentBytes)) {
                    context.getLogger().log("Invalid file type or format detected: " + filename);
                    return createErrorResponse(response, 400, "Invalid file type or format. Only PNG, JPEG, and PDF files up to 10MB are allowed.");
                }
            }
            
            // Now validate token and email if provided
            if ((token == null || token.isEmpty()) && (email == null || email.isEmpty())) {
                context.getLogger().log("Warning: Token and email not provided");
            } else if (token != null && !token.isEmpty() && email != null && !email.isEmpty()) {
                context.getLogger().log("Validating token and email...");
                
                boolean isTokenValid = validateToken(token, email, context);
                if (!isTokenValid) {
                    context.getLogger().log("Token validation failed for email: " + email);
                    return createErrorResponse(response, 401, "Invalid token. Upload not authorized.");
                }
                
                context.getLogger().log("Token validated successfully for email: " + email);
            }
            
            String fileExtension = "";
            if (filename != null && filename.contains(".")) {
                fileExtension = filename.substring(filename.lastIndexOf("."));
            }
            
            String baseFilename;
            if (email != null && !email.isEmpty()) {
                baseFilename = sanitizeFilename(email);
                context.getLogger().log("Using email as base filename: " + baseFilename);
            } else {
                baseFilename = UUID.randomUUID().toString();
                context.getLogger().log("No email provided, using UUID as filename");
            }
            
            String key = "uploads/" + baseFilename + fileExtension;
            
            String fileUrl = uploadToS3(fileContent, isFileBase64Encoded, key, context, filename);
            
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
            
            byte[] bodyBytes;
            if (isBase64Encoded) {
                bodyBytes = Base64.getDecoder().decode(body);
                body = new String(bodyBytes);
            } else {
                bodyBytes = body.getBytes();
            }
            
            Map<String, Object> result = new HashMap<>();
            
            String contentType = (String) ((Map)request.get("headers")).get("content-type");
            String boundary = extractBoundary(contentType);
            
            if (boundary == null) {
                context.getLogger().log("No boundary found in Content-Type header");
                return null;
            }
            
            String[] parts = body.split("--" + boundary);
            
            for (String part : parts) {
                if (part.trim().isEmpty() || part.equals("--")) {
                    continue;
                }
                
                int headerEnd = part.indexOf("\r\n\r\n");
                if (headerEnd == -1) {
                    continue;
                }
                
                String headers = part.substring(0, headerEnd);
                String content = part.substring(headerEnd + 4);
                
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
                    Map<String, Object> fileData = new HashMap<>();
                    fileData.put("filename", filename);
                    
                    int startPos = body.indexOf(content);
                    if (content.endsWith("\r\n")) {
                        content = content.substring(0, content.length() - 2);
                    }
                    
                    if (isBinaryFile(filename)) {
                        String headersPart = part.substring(0, headerEnd + 4);
                        int contentStart = body.indexOf(headersPart) + headersPart.length();
                        int contentLength = content.length();
                        
                        byte[] fileBytes;
                        if (contentLength > 0 && contentStart + contentLength <= bodyBytes.length) {
                            fileBytes = new byte[contentLength];
                            System.arraycopy(bodyBytes, contentStart, fileBytes, 0, contentLength);
                            
                            fileData.put("content", Base64.getEncoder().encodeToString(fileBytes));
                            fileData.put("isBase64Encoded", true);
                        } else {
                            fileData.put("content", content);
                            fileData.put("isBase64Encoded", false);
                        }
                    } else {
                        fileData.put("content", content);
                        fileData.put("isBase64Encoded", false);
                    }
                    
                    result.put(fieldName, fileData);
                } else {
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
        
        String boundary = contentType.substring(boundaryIndex + 9);
        
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
        
        int nameStart = nameIndex + 6;
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
        
        int filenameStart = filenameIndex + 10;
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
            
            if (filename != null && !filename.isEmpty()) {
                String contentType = determineContentType(filename);
                if (contentType != null) {
                    metadata.setContentType(contentType);
                }
            }
            
            s3Client.putObject(bucketName, key, inputStream, metadata);
            
            return s3Client.getUrl(bucketName, key).toString();
        } catch (Exception e) {
            context.getLogger().log("Error uploading to S3: " + e.getMessage());
            throw new RuntimeException("Failed to upload to S3: " + e.getMessage(), e);
        }
    }
    
    private boolean isValidFileType(String fileName, String contentType, byte[] content) {
        if (fileName == null || contentType == null || content == null || content.length == 0) {
            return false;
        }
        
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return false;
        }
        
        boolean validContentType = switch (extension) {
            case "png" -> contentType.equals("image/png");
            case "jpg", "jpeg" -> contentType.equals("image/jpeg");
            case "pdf" -> contentType.equals("application/pdf");
            default -> false;
        };
        
        if (!validContentType) {
            return false;
        }
        
        byte[] signature = FILE_SIGNATURES.get(extension);
        if (signature != null && content.length >= signature.length) {
            for (int i = 0; i < signature.length; i++) {
                if (content[i] != signature[i]) {
                    return false;
                }
            }
        }
        
        if (content.length > 10 * 1024 * 1024) {
            return false;
        }
        
        return true;
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
            String serviceUrl = "";
            if (request.containsKey("queryStringParameters") && 
                ((Map)request.get("queryStringParameters")) != null &&
                ((Map)request.get("queryStringParameters")).containsKey("url")) {
                serviceUrl = (String) ((Map)request.get("queryStringParameters")).get("url");
            } else {
                return createErrorResponse(response, 400, "Missing 'url' parameter");
            }
            
            context.getLogger().log("Making GET request to: " + serviceUrl);
            
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();
                    
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(serviceUrl))
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .build();
                    
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            int statusCode = httpResponse.statusCode();
            String body = httpResponse.body();
            
            if (statusCode >= 200 && statusCode < 300) {
                response.put("statusCode", 200);
                response.put("body", body);
            } else {
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

    private boolean validateToken(String token, String email, Context context) {
        try {
            String validationUrl = "http://client.ecs.internal:8080/api/v1/clients/validate-upload-token?token=" 
                + token + "&email=" + email;
            
            context.getLogger().log("Validating token at URL: " + validationUrl);
            
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();
                    
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(validationUrl))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .header("Accept", "application/json")
                    .build();
                    
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            int statusCode = httpResponse.statusCode();
            String body = httpResponse.body();
            
            context.getLogger().log("Token validation response code: " + statusCode);
            context.getLogger().log("Token validation response body: " + body);
            
            if (statusCode >= 200 && statusCode < 300) {
                boolean isValid = Boolean.parseBoolean(body);
                return isValid;
            } else {
                context.getLogger().log("Token validation failed with status code: " + statusCode);
                return false;
            }
        } catch (Exception e) {
            context.getLogger().log("Error validating token: " + e.getMessage());
            return false;
        }
    }
}
